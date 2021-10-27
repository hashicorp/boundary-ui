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

module('Acceptance | accounts | create', function (hooks) {
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
    newAccount: null,
    account: null,
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
    urls.newAccount = `${urls.accounts}/new`;
    urls.account = `${urls.accounts}/${instances.account.id}`;
  });

  hooks.afterEach(async function () {
    const notification = find('.rose-notification');
    if (notification) {
      await click('.rose-notification-dismiss');
    }
  });

  test('visiting accounts', async function (assert) {
    assert.expect(1);
    await visit(urls.accounts);
    await a11yAudit();
    assert.equal(currentURL(), urls.accounts);
  });

  test('can create a new account', async function (assert) {
    assert.expect(1);
    const accountsCount = this.server.db.accounts.length;
    await visit(urls.newAccount);
    await fillIn('[name="name"]', 'Account name');
    await fillIn('[name="description"]', 'description');
    await fillIn('[name="login_name"]', 'username');
    await fillIn('[name="password"]', 'password');
    await click('form [type="submit"]:not(:disabled)');
    assert.equal(this.server.db.accounts.length, accountsCount + 1);
  });

  test('Users cannot create a new account without proper authorization', async function (assert) {
    assert.expect(2);
    instances.authMethod.authorized_collection_actions.accounts = [];
    await visit(urls.authMethod);
    assert.notOk(
      instances.authMethod.authorized_collection_actions.accounts.includes(
        'create'
      )
    );
    assert.notOk(find(`.rose-layout-page-actions [href="${urls.newAccount}"]`));
  });

  test('Users can navigate to new account route with proper authorization', async function (assert) {
    assert.expect(2);
    await visit(urls.authMethod);
    assert.ok(
      instances.authMethod.authorized_collection_actions.accounts.includes(
        'create'
      )
    );
    assert.ok(find(`[href="${urls.accounts}"]`));
  });

  test('Users cannot navigate to new account route without proper authorization', async function (assert) {
    assert.expect(2);
    instances.authMethod.authorized_collection_actions.accounts = [];
    await visit(urls.authMethod);
    assert.notOk(
      instances.authMethod.authorized_collection_actions.accounts.includes(
        'create'
      )
    );
    assert.notOk(find(`[href="${urls.accounts}"]`));
  });

  test('can cancel a new account creation', async function (assert) {
    assert.expect(2);
    const accountsCount = this.server.db.accounts.length;
    await visit(urls.newAccount);
    await fillIn('[name="name"]', 'Account name');
    await click('form button:not([type="submit"])');
    assert.equal(this.server.db.accounts.length, accountsCount);
    assert.equal(currentURL(), urls.accounts);
  });

  test('saving a new account with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.post('/accounts', () => {
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
    await visit(urls.newAccount);
    await fillIn('[name="name"]', 'new account');
    await click('form [type="submit"]');
    await a11yAudit();
    assert.equal(
      find('.rose-notification-body').textContent.trim(),
      'The request was invalid.',
      'Displays primary error message.'
    );
    assert.equal(
      find('.rose-form-error-message').textContent.trim(),
      'Name is required.',
      'Displays field-level errors.'
    );
  });
});
