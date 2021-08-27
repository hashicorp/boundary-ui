import { module, test } from 'qunit';
import { visit, currentURL, find, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | scopes | update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

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
    authenticateSession({});
  });

  test('can save changes to existing scope', async function (assert) {
    assert.expect(3);
    assert.notEqual(instances.scopes.org.name, 'random string');
    await visit(urls.orgScopeEdit);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="submit"]');
    assert.equal(currentURL(), urls.orgScopeEdit);
    assert.equal(
      this.server.schema.scopes.where({ type: 'org' }).models[0].name,
      'random string'
    );
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
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'The request was invalid.'
    );
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
      assert.notEqual(
        this.server.schema.scopes.where({ type: 'org' }).models[0].name,
        'random string'
      );
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
      assert.notEqual(
        this.server.schema.scopes.where({ type: 'org' }).models[0].name,
        'random string'
      );
    }
  });
});
