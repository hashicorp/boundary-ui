import { module, test } from 'qunit';
import { visit, find, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import { resolve, reject } from 'rsvp';
import sinon from 'sinon';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | targets', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let getTargetCount;

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
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    urls.target = `${urls.targets}/${instances.target.id}`;
    urls.unknownTarget = `${urls.targets}/foo`;
    urls.newTarget = `${urls.targets}/new`;
    // Generate resource couner
    getTargetCount = () => this.server.schema.targets.all().models.length;
    authenticateSession({});
  });

  test('can delete target', async function (assert) {
    assert.expect(1);
    const count = getTargetCount();
    await visit(urls.target);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(getTargetCount(), count - 1);
  });

  test('can accept delete target via dialog', async function (assert) {
    assert.expect(2);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(resolve());
    const count = getTargetCount();
    await visit(urls.target);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(getTargetCount(), count - 1);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('cannot cancel delete target via dialog', async function (assert) {
    assert.expect(2);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(reject());
    const count = getTargetCount();
    await visit(urls.target);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(getTargetCount(), count);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('cannot delete target without proper authorization', async function (assert) {
    assert.expect(1);
    instances.target.authorized_actions =
      instances.target.authorized_actions.filter((item) => item !== 'delete');
    await visit(urls.target);
    assert.notOk(
      find('.rose-layout-page-actions .rose-dropdown-button-danger')
    );
  });

  test('deleting a target which errors displays error messages', async function (assert) {
    assert.expect(1);
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
    await visit(urls.target);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.ok(find('[role="alert"]').textContent.trim(), 'Oops.');
  });
});
