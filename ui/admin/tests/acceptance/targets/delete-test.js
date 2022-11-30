import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | targets | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let getTargetCount;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    target: null,
  };
  const urls = {
    orgScope: null,
    projectScope: null,
    targets: null,
    target: null,
    newTarget: null,
  };

  hooks.beforeEach(function () {
    // Generate resources
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.target = this.server.create('target', {
      scope: instances.scopes.project,
    });
    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    urls.target = `${urls.targets}/${instances.target.id}`;
    urls.newTarget = `${urls.targets}/new`;
    // Generate resource counter
    getTargetCount = () => this.server.schema.targets.all().models.length;
    authenticateSession({});
  });

  test('can delete target', async function (assert) {
    assert.expect(1);
    const targetCount = getTargetCount();
    await visit(urls.targets);

    await click(`[href="${urls.target}"]`);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');

    assert.strictEqual(getTargetCount(), targetCount - 1);
  });

  test('can accept delete target via dialog', async function (assert) {
    assert.expect(3);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    const targetCount = getTargetCount();
    await visit(urls.targets);

    await click(`[href="${urls.target}"]`);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    await click('.rose-dialog .rose-button-primary');

    assert.dom('.rose-notification-body').hasText('Deleted successfully.');
    assert.strictEqual(getTargetCount(), targetCount - 1);
    assert.strictEqual(currentURL(), urls.targets);
  });

  test('cannot cancel delete target via dialog', async function (assert) {
    assert.expect(2);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    const targetCount = getTargetCount();
    await visit(urls.targets);

    await click(`[href="${urls.target}"]`);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    await click('.rose-dialog .rose-button-secondary');

    assert.strictEqual(getTargetCount(), targetCount);
    assert.strictEqual(currentURL(), urls.target);
  });

  test('cannot delete target without proper authorization', async function (assert) {
    assert.expect(1);
    await visit(urls.targets);
    instances.target.authorized_actions =
      instances.target.authorized_actions.filter((item) => item !== 'delete');

    await click(`[href="${urls.target}"]`);

    assert
      .dom('.rose-layout-page-actions .rose-dropdown-button-danger')
      .doesNotExist();
  });

  test('deleting a target which errors displays error messages', async function (assert) {
    assert.expect(1);
    await visit(urls.targets);
    this.server.del('/targets/:id', () => {
      return new Response(
        490,
        {},
        {
          status: 490,
          code: 'error',
          message: 'Oops.',
        }
      );
    });

    await click(`[href="${urls.target}"]`);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');

    assert.dom('.rose-notification-body').hasText('Oops.');
  });
});
