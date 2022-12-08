import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
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
      project: null,
    },
  };
  const urls = {
    globalScope: null,
    orgScope: null,
    orgScopeEdit: null,
    projectScope: null,
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
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.orgScopeEdit = `/scopes/${instances.scopes.org.id}/edit`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    authenticateSession({ isGlobal: true });
  });

  test('can save changes to existing scope', async function (assert) {
    assert.expect(3);
    assert.notEqual(instances.scopes.org.name, 'random string');
    await visit(urls.orgScope);

    await click(`[href="${urls.orgScopeEdit}"]`);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="submit"]');

    assert.strictEqual(currentURL(), urls.orgScopeEdit);
    assert.strictEqual(
      this.server.schema.scopes.where({ type: 'org' }).models[0].name,
      'random string'
    );
  });

  test('cannot save changes to without proper authorization', async function (assert) {
    assert.expect(2);
    instances.scopes.org.update({
      authorized_actions: instances.scopes.org.authorized_actions.filter(
        (item) => item !== 'update'
      ),
    });
    await visit(urls.orgScope);

    await click(`[href="${urls.orgScopeEdit}"]`);

    assert.false(instances.scopes.org.authorized_actions.includes('update'));
    assert.dom('form [type="button"]').doesNotExist();
  });

  test('can cancel changes to existing scope', async function (assert) {
    assert.expect(2);
    await visit(urls.orgScope);

    await click(`[href="${urls.orgScopeEdit}"]`);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');

    assert.notEqual(instances.scopes.org.name, 'random string');
    assert.dom('[name="name"]').hasValue(instances.scopes.org.name);
  });

  test('saving an existing scope with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    await visit(urls.orgScope);
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

    await click(`[href="${urls.orgScopeEdit}"]`);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');

    assert.dom('[role="alert"] div').hasText('The request was invalid.');
    assert.dom('.hds-form-error__message').hasText('Name is required.');
  });

  test('can discard unsaved scope changes via dialog', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.scopes.org.name, 'random string');
    await visit(urls.orgScope);

    await click(`[href="${urls.orgScopeEdit}"]`);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    assert.strictEqual(currentURL(), urls.orgScopeEdit);
    await click(`[href="${urls.globalScope}"]`);
    assert.dom('.rose-dialog').exists();
    await click('.rose-dialog-footer button:first-child', 'Click Discard');

    assert.strictEqual(currentURL(), urls.globalScope);
    assert.notEqual(
      this.server.schema.scopes.where({ type: 'org' }).models[0].name,
      'random string'
    );
  });

  test('can click cancel on discard dialog box for unsaved scope changes', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.scopes.org.name, 'random string');
    await visit(urls.orgScope);

    await click(`[href="${urls.orgScopeEdit}"]`);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    assert.strictEqual(currentURL(), urls.orgScopeEdit);
    await click(`[href="${urls.globalScope}"]`);
    assert.dom('.rose-dialog').exists();
    await click('.rose-dialog-footer button:last-child', 'Click Cancel');

    assert.strictEqual(currentURL(), urls.orgScopeEdit);
    assert.notEqual(
      this.server.schema.scopes.where({ type: 'org' }).models[0].name,
      'random string'
    );
  });
});
