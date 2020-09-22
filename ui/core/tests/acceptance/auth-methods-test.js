import { module, test } from 'qunit';
import { visit, currentURL, click, find, fillIn } from '@ember/test-helpers';
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
    urls.newAuthMethod = `${urls.authMethods}/new`;
    urls.authMethod = `${urls.authMethods}/${instances.authMethod.id}`;
  });

  test('visiting auth methods', async function (assert) {
    assert.expect(1);
    await visit(urls.authMethods);
    await a11yAudit();
    assert.equal(currentURL(), urls.authMethods);
  });

  test('can navigate to an auth method form', async function (assert) {
    assert.expect(1);
    await visit(urls.authMethods);
    await click('main tbody .rose-table-header-cell:nth-child(1) a');
    await a11yAudit();
    assert.equal(currentURL(), urls.authMethod);
  });

  test('can update an auth method and save changes', async function (assert) {
    assert.expect(1);
    await visit(urls.authMethod);
    await fillIn('[name="name"]', 'update name');
    await click('form [type="submit"]:not(:disabled)');
    assert.equal(this.server.db.authMethods[0].name, 'update name');
  });

  test('can update an auth method and cancel changes', async function (assert) {
    assert.expect(1);
    await visit(urls.authMethod)
    await fillIn('[name="name"]', 'update name');
    await click('form button:not([type="submit"])');
    assert.notEqual(this.server.db.authMethods[0].name, 'update name');
  });

  test('can create new auth method', async function (assert) {
    assert.expect(1);
    const authMethodsCount = this.server.db.authMethods.length;
    await visit(urls.newAuthMethod);
    await fillIn('[name="name"]', 'AuthMethod name');
    await fillIn('[name="description"]', 'description');
    await click('form [type="submit"]:not(:disabled)');
    assert.equal(this.server.db.authMethods.length, authMethodsCount + 1);
  });

  test('can cancel new auth method creation', async function (assert) {
    assert.expect(2);
    const authMethodsCount = this.server.db.authMethods.length;
    await visit(urls.newAuthMethod);
    await fillIn('[name="name"]', 'AuthMethod name');
    await fillIn('[name="description"]', 'description');
    await click('form button:not([type="submit"])');
    assert.equal(this.server.db.authMethods.length, authMethodsCount);
    assert.equal(currentURL(), urls.authMethods);
  });

  test('can delete an auth method', async function (assert) {
    assert.expect(1);
    const authMethodsCount = this.server.db.authMethods.length;
    await visit(urls.authMethod);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(this.server.db.authMethods.length, authMethodsCount - 1);
  });

  test('saving a new auth method with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.post('/auth-methods', () => {
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
    await visit(urls.newAuthMethod);
    await fillIn('[name="name"]', 'new auth method');
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

  test('errors are displayed when save on auth method fails', async function (assert) {
    assert.expect(1);
    this.server.patch('/auth-methods/:id', () => {
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
    await visit(urls.authMethod);
    await fillIn('[name="name"]', 'save auth method');
    await click('form [type="submit"]');
    await a11yAudit();
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'Oops.',
      'Displays primary error message.'
    );
  });

  test('errors are displayed when delete on an auth method fails', async function (assert) {
    assert.expect(1);
    this.server.del('/auth-methods/:id', () => {
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
    await visit(urls.authMethod);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    await a11yAudit();
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'Oops.',
      'Displays primary error message.'
    );
  });

  test('saving a new auth method with invalid fields displays error messages', async function (assert) {
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
