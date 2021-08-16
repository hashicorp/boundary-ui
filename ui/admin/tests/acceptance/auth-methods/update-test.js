import { module, test } from 'qunit';
import { visit, click, find, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import {
  authenticateSession,
  //   // These are left here intentionally for future reference.
  //   //currentSession,
  //   //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | auth methods', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    authMethod: null,
  };
  const urls = {
    orgScope: null,
    authMethods: null,
    newAuthMethod: null,
    authMethod: null,
  };

  hooks.beforeEach(function () {
    // Setup Mirage mock resources for this test
    authenticateSession({});
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.authMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
    });

    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.authMethods = `${urls.orgScope}/auth-methods`;
    urls.newAuthMethod = `${urls.authMethods}/new?type=password`;
    urls.authMethod = `${urls.authMethods}/${instances.authMethod.id}`;
  });

  test('can update an auth method and save changes', async function (assert) {
    assert.expect(1);
    await visit(urls.authMethod);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'update name');
    await click('form [type="submit"]:not(:disabled)');
    assert.equal(this.server.db.authMethods[0].name, 'update name');
  });

  test('can update an auth method and cancel changes', async function (assert) {
    assert.expect(1);
    await visit(urls.authMethod);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'update name');
    await click('form button:not([type="submit"])');
    assert.notEqual(this.server.db.authMethods[0].name, 'update name');
  });

  test('cannot make changes to an existing auth method without proper authorization', async function (assert) {
    assert.expect(1);
    instances.authMethod.authorized_actions =
      instances.authMethod.authorized_actions.filter(
        (item) => item !== 'update'
      );
    await visit(urls.authMethod);
    assert.notOk(find('.rose-layout-page-actions .rose-button-secondary'));
  });

  test('saving an existing auth method with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.patch('/auth-methods/:id', () => {
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
    await visit(urls.authMethod);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'existing auth method');
    await click('form [type="submit"]');
    await a11yAudit();
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'The request was invalid.',
      'Displays primary error message.'
    );
    assert.ok(
      find('.rose-form-error-message').textContent.trim(),
      'Name is required.',
      'Displays field-level errors.'
    );
  });

  test('saving an existing auth method with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.patch('/auth-methods/:id', () => {
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
    await visit(urls.authMethod);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'existing auth method');
    await click('form [type="submit"]');
    await a11yAudit();
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'The request was invalid.',
      'Displays primary error message.'
    );
    assert.ok(
      find('.rose-form-error-message').textContent.trim(),
      'Name is required.',
      'Displays field-level errors.'
    );
  });
});
