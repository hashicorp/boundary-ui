import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | auth methods', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null
    },
    authMethod: null
  };
  const urls = {
    orgScope: null,
    authMethods: null
  };

  hooks.beforeEach(function () {
    // Setup Mirage mock resources for this test
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', { type: 'org',
      scope: { id: instances.scopes.global.id, type: instances.scopes.global.type }
    });
    instances.authMethod = this.server.create('auth-method', {
      scope: {
        id: instances.scopes.org.id,
        type: instances.scopes.org.type
      }
    });

    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.authMethods = `${urls.orgScope}/auth-methods`;
  });

  test('visiting auth methods', async function (assert) {
    assert.expect(1);
    authenticateSession();
    await visit(urls.authMethods);
    await a11yAudit();
    assert.equal(currentURL(), urls.authMethods);
  });

  test('can navigate to an auth method form', async function (assert) {
    assert.expect(0);
  });

  test('can update an auth method and save changes', async function (assert) {
    assert.expect(0);
  });

  test('can update an auth method and cancel changes', async function (assert) {
    assert.expect(0);
  });

  test('can create new auth method', async function (assert) {
    assert.expect(0);
  });

  test('can cancel new auth method creation', async function (assert) {
    assert.expect(0);
  });

  test('can delete an auth method', async function (assert) {
    assert.expect(0);
  });

  test('saving a new auth method with invalid fields displays error messages', async function (assert) {
    assert.expect(0);
  });

  test('errors are displayed when save on auth method fails', async function (assert) {
    assert.expect(0);
  });

  test('errors are displayed when delete on an auth method fails', async function (assert) {
    assert.expect(0);
  });

  test('saving a new auth method with invalid fields displays error messages', async function (assert) {
    assert.expect(0);
  });

  test('saving an existing auth method with invalid fields displays error messages', async function (assert) {
    assert.expect(0);
  });
});
