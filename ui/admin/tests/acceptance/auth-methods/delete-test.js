import { module, test } from 'qunit';
import { visit, click, find } from '@ember/test-helpers';
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

  test('can delete an auth method', async function (assert) {
    assert.expect(1);
    const authMethodsCount = this.server.db.authMethods.length;
    await visit(urls.authMethod);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(this.server.db.authMethods.length, authMethodsCount - 1);
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

  test('cannot delete an auth method without proper authorization', async function (assert) {
    assert.expect(1);
    instances.authMethod.authorized_actions =
      instances.authMethod.authorized_actions.filter(
        (item) => item !== 'delete'
      );
    await visit(urls.authMethod);
    assert.notOk(
      find('.rose-layout-page-actions .rose-dropdown-button-danger')
    );
  });
});
