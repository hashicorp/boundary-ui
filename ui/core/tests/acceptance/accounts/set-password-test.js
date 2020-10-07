import { module, test } from 'qunit';
import { visit, currentURL, click, find, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | accounts | set password', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    authMethods: null,
    account: null,
  };
  const urls = {
    orgScope: null,
    authMethods: null,
    accounts: null,
    setPassword: null,
  };

  hooks.beforeEach(function () {
    authenticateSession({});
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.authMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
    });
    instances.account = this.server.create('account', {
      scope: instances.scopes.org,
      authMethod: instances.authMethod,
    });
    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.authMethods = `${urls.orgScope}/auth-methods`;
    urls.authMethod = `${urls.authMethods}/${instances.authMethod.id}`;
    urls.accounts = `${urls.authMethod}/accounts`;
    urls.setPassword = `${urls.accounts}/${instances.account.id}/set-password`;
  });

  test('visiting account set password', async function (assert) {
    assert.expect(1);
    await visit(urls.setPassword);
    await a11yAudit();
    assert.equal(currentURL(), urls.setPassword);
  });

  test('can set a new password for account', async function (assert) {
    assert.expect(1);
    this.server.post('/accounts/:idMethod', (_, { params: { idMethod }, requestBody }) => {
      const attrs = JSON.parse(requestBody);
      assert.equal(attrs.password, 'update password', 'new password is set');
      const id = idMethod.split(':')[0];
      return { id };
    });
    await visit(urls.setPassword);
    await fillIn('[name="password"]', 'update password');
    await click('form [type="submit"]:not(:disabled)');
    await a11yAudit();
  });

  // NOTE: since set password is a tabbed route with easy navigation away
  // from the form, and the form does not directly operate on a model instance,
  // a "cancel" flow doesn't make much sense.  Disabling for now.
  // test('can cancel setting new password', async function (assert) {
  //   assert.expect(1);
  //   await visit(urls.setPassword);
  //   await fillIn('[name="password"]', 'update password');
  //   await click('form button:not([type="submit"])');
  //   assert.notOk(find('[name="password"]').textContent.trim());
  // });

  test('errors are displayed when setting password fails', async function  (assert) {
    assert.expect(1);
    this.server.post('/accounts/:id', () => {
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
    await visit(urls.setPassword);
    await fillIn('[name="password"]', 'update password');
    await click('form [type="submit"]');
    await a11yAudit();
    assert.ok(find('[role="alert"]'));
  });
});
