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

module('Acceptance | scopes | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let getScopeCount;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
  };
  const urls = {
    globalScope: null,
    orgScope: null,
    orgScopeEdit: null,
    projectScope: null,
    projectScopeEdit: null,
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
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.orgScopeEdit = `/scopes/${instances.scopes.org.id}/edit`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    // Generate resource counter
    getScopeCount = (type) => this.server.schema.scopes.where({ type }).length;
    authenticateSession({ isGlobal: true });
  });

  test('can delete scope', async function (assert) {
    assert.expect(1);
    const orgScopeCount = getScopeCount('org');
    await visit(urls.orgScope);

    await click(`[href="${urls.orgScopeEdit}"]`);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');

    assert.strictEqual(getScopeCount('org'), orgScopeCount - 1);
  });

  test('cannot delete scope without proper authorization', async function (assert) {
    assert.expect(2);
    instances.scopes.org.update({
      authorized_actions: instances.scopes.org.authorized_actions.filter(
        (item) => item !== 'delete'
      ),
    });
    await visit(urls.orgScope);

    await click(`[href="${urls.orgScopeEdit}"]`);

    assert.false(instances.scopes.org.authorized_actions.includes('delete'));
    assert
      .dom('.rose-layout-page-actions .rose-dropdown-button-danger')
      .doesNotExist();
  });

  test('can accept delete scope via dialog', async function (assert) {
    assert.expect(2);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    const orgScopeCount = getScopeCount('org');
    await visit(urls.orgScope);

    await click(`[href="${urls.orgScopeEdit}"]`);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    await click('.rose-dialog .rose-button-primary');

    assert.strictEqual(getScopeCount('org'), orgScopeCount - 1);
    assert.strictEqual(currentURL(), urls.globalScope);
  });

  test('can cancel delete scope via dialog', async function (assert) {
    assert.expect(2);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    const orgScopeCount = getScopeCount('org');
    await visit(urls.orgScope);

    await click(`[href="${urls.orgScopeEdit}"]`);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    await click('.rose-dialog .rose-button-secondary');

    assert.strictEqual(getScopeCount('org'), orgScopeCount);
    assert.strictEqual(currentURL(), urls.orgScopeEdit);
  });

  test('deleting a scope which errors displays error messages', async function (assert) {
    assert.expect(1);
    await visit(urls.orgScope);
    this.server.del('/scopes/:id', () => {
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

    await click(`[href="${urls.orgScopeEdit}"]`);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');

    assert.dom('.rose-notification-body').hasText('Oops.');
  });
});
