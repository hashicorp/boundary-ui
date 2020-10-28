import { module, test } from 'qunit';
import { visit, currentURL, find, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import { resolve, reject } from 'rsvp';
import sinon from 'sinon';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | scopes', function (hooks) {
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
    }
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
    // Generate scope couners
    getScopeCount = (type) => this.server.schema.scopes.where({ type }).length;
    authenticateSession({});
  });

  test('visiting global scope', async function (assert) {
    assert.expect(1);
    await visit(urls.globalScope);
    await a11yAudit();
    assert.equal(currentURL(), urls.globalScope);
  });

  // TODO: this probably shouldn't be the case, but was setup to enable
  // authentication when the global scope couldn't be loaded.
  // In order to resolve this, we might hoist authentication routes up from
  // under scopes.
  test('visiting global scope is successful even when the global scope cannot be fetched', async function (assert) {
    assert.expect(1);
    this.server.get('/scopes/:id', ({ scopes }, { params: { id } }) => {
      const scope = scopes.find(id);
      const response = (id === 'global')
        ? new Response(404)
        : scope;
      return response;
    });
    await visit(urls.globalScope);
    assert.equal(currentURL(), urls.globalScope);
  });

  test('visiting org scope', async function (assert) {
    assert.expect(1);
    await visit(urls.orgScope);
    await a11yAudit();
    assert.equal(currentURL(), urls.orgScope);
  });

  // NOTE:  In reality, we'd have a third "Global" item listed in the org
  // dropdown.  But since the mock test authenticator bypasses the auth
  // normalization step, the UI doesn't know it's authenticated with global
  // and thus doesn't display the "Global" item in the org nav dropdown.
  test('can navigate among org scopes via header navigation', async function (assert) {
    assert.expect(3);
    await visit(urls.globalScope);
    await a11yAudit();
    assert.equal(currentURL(), urls.globalScope);
    await click('.rose-header-nav .rose-dropdown a:nth-child(1)');
    assert.equal(currentURL(), urls.orgScope);
    // In reality, there would be a third item in the list
    await click('.rose-header-nav .rose-dropdown a:nth-child(2)');
    assert.equal(currentURL(), urls.org2Scope);
  });

  test('can navigate among project scopes via header navigation', async function (assert) {
    assert.expect(2);
    await visit(urls.projectScope);
    await a11yAudit();
    assert.equal(currentURL(), urls.projectScopeEdit);
    await click('.rose-header-nav .rose-dropdown + .rose-dropdown a:nth-child(2)');
    assert.equal(currentURL(), urls.project2ScopeEdit);
  });

  test('can create new org scopes', async function (assert) {
    assert.expect(1);
    const orgScopeCount = getScopeCount('org');
    await visit(urls.newOrgScope);
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');
    assert.equal(getScopeCount('org'), orgScopeCount + 1);
  });

  test('can create new project scopes', async function (assert) {
    assert.expect(1);
    const orgScopeCount = getScopeCount('project');
    await visit(urls.newProjectScope);
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');
    assert.equal(getScopeCount('project'), orgScopeCount + 1);
  });

  test('can cancel create new org scopes', async function (assert) {
    assert.expect(2);
    const orgScopeCount = getScopeCount('org');
    await visit(urls.newOrgScope);
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.equal(currentURL(), urls.globalScope);
    assert.equal(getScopeCount('org'), orgScopeCount);
  });

  test('can cancel create new project scopes', async function (assert) {
    assert.expect(2);
    const projectScopeCount = getScopeCount('project');
    await visit(urls.newProjectScope);
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.equal(currentURL(), urls.orgScope);
    assert.equal(getScopeCount('project'), projectScopeCount);
  });

  test('saving a new scope with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.post('/scopes', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {
            request_fields: [
              {
                name: 'name',
                description: 'Name is required.',
              },
            ],
          },
        }
      );
    });
    await visit(urls.newOrgScope);
    await click('[type="submit"]');
    assert.ok(find('[role="alert"]').textContent.trim(), 'The request was invalid.');
    assert.ok(
      find('.rose-form-error-message').textContent.trim(),
      'Name is required.'
    );
  });

  test('can save changes to existing scope', async function (assert) {
    assert.expect(3);
    assert.notEqual(instances.scopes.org.name, 'random string');
    await visit(urls.orgScopeEdit);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="submit"]');
    assert.equal(currentURL(), urls.orgScopeEdit);
    assert.equal(this.server.schema.scopes.where({ type: 'org' }).models[0].name, 'random string');
  });

  test('can cancel changes to existing scope', async function (assert) {
    assert.expect(2);
    await visit(urls.orgScopeEdit);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.notEqual(instances.scopes.org.name, 'random string');
    assert.equal(find('[name="name"]').value, instances.scopes.org.name);
  });

  test('saving an existing scope with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.patch('/scopes/:id', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {
            request_fields: [
              {
                name: 'name',
                description: 'Name is required.',
              },
            ],
          },
        }
      );
    });
    await visit(urls.orgScopeEdit);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');
    assert.ok(find('[role="alert"]').textContent.trim(), 'The request was invalid.');
    assert.ok(
      find('.rose-form-error-message').textContent.trim(),
      'Name is required.'
    );
  });

  test('can discard unsaved scope changes via dialog', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.scopes.org.name, 'random string');
    await visit(urls.orgScopeEdit);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    assert.equal(currentURL(), urls.orgScopeEdit);
    try {
      await visit(urls.globalScope);
    } catch (e) {
      assert.ok(find('.rose-dialog'));
      await click('.rose-dialog-footer button:first-child');
      assert.equal(currentURL(), urls.globalScope);
      assert.notEqual(this.server.schema.scopes.where({ type: 'org' }).models[0].name, 'random string');
    }
  });

  test('can cancel discard unsaved scope changes via dialog', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.scopes.org.name, 'random string');
    await visit(urls.orgScopeEdit);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    assert.equal(currentURL(), urls.orgScopeEdit);
    try {
      await visit(urls.globalScope);
    } catch (e) {
      assert.ok(find('.rose-dialog'));
      await click('.rose-dialog-footer button:last-child');
      assert.equal(currentURL(), urls.orgScopeEdit);
      assert.notEqual(this.server.schema.scopes.where({ type: 'org' }).models[0].name, 'random string');
    }
  });

  test('can delete scope', async function (assert) {
    assert.expect(1);
    const orgScopeCount = getScopeCount('org');
    await visit(urls.orgScopeEdit);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(getScopeCount('org'), orgScopeCount - 1);
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
