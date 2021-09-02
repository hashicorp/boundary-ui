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

module('Acceptance | scopes | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let getScopeCount;

  const instances = {
    scopes: {
      global: null,
      org: null,
      org2: null,
      project: null,
      project2: null,
    },
  };
  const urls = {
    globalScope: null,
    orgScope: null,
    org2Scope: null,
    orgScopeEdit: null,
    org2ScopeEdit: null,
    projectScope: null,
    project2Scope: null,
    projectScopeEdit: null,
    project2ScopeEdit: null,
  };

  hooks.beforeEach(function () {
    // Generate resources
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.org2 = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.scopes.project2 = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.newOrgScope = `/scopes/global/new`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.org2Scope = `/scopes/${instances.scopes.org2.id}/scopes`;
    urls.orgScopeEdit = `/scopes/${instances.scopes.org.id}/edit`;
    urls.org2ScopeEdit = `/scopes/${instances.scopes.org2.id}/edit`;
    urls.newProjectScope = `/scopes/${instances.scopes.org.id}/new`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.project2Scope = `/scopes/${instances.scopes.project2.id}`;
    urls.projectScopeEdit = `/scopes/${instances.scopes.project.id}/edit`;
    urls.project2ScopeEdit = `/scopes/${instances.scopes.project2.id}/edit`;
    // Generate resource couner
    getScopeCount = (type) => this.server.schema.scopes.where({ type }).length;
    authenticateSession({});
  });

  test('can delete scope', async function (assert) {
    assert.expect(1);
    const orgScopeCount = getScopeCount('org');
    await visit(urls.orgScopeEdit);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(getScopeCount('org'), orgScopeCount - 1);
  });

  test('cannot delete scope without proper authorization', async function (assert) {
    assert.expect(1);
    instances.scopes.org.update({ authorized_actions: [] });
    await visit(urls.orgScopeEdit);
    assert.notOk(
      find('.rose-layout-page-actions .rose-dropdown-button-danger')
    );
  });

  test('can accept delete scope via dialog', async function (assert) {
    assert.expect(2);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(resolve());
    const orgScopeCount = getScopeCount('org');
    await visit(urls.orgScopeEdit);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(getScopeCount('org'), orgScopeCount - 1);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('cannot cancel delete scope via dialog', async function (assert) {
    assert.expect(2);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(reject());
    const orgScopeCount = getScopeCount('org');
    await visit(urls.orgScopeEdit);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(getScopeCount('org'), orgScopeCount);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('deleting a scope which errors displays error messages', async function (assert) {
    assert.expect(1);
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
    await visit(urls.orgScopeEdit);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.ok(find('[role="alert"]').textContent.trim(), 'Oops.');
  });
});
