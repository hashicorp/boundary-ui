import { module, test } from 'qunit';
import { visit, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | accounts | list', function (hooks) {
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

  test('Users can navigate to accounts with proper authorization', async function (assert) {
    assert.expect(2);
    await visit(urls.authMethod);
    assert.ok(
      instances.authMethod.authorized_collection_actions.accounts.includes(
        'list'
      )
    );
    assert.ok(find(`[href="${urls.accounts}"]`));
  });

  test('User cannot navigate to index without either list or create actions', async function (assert) {
    assert.expect(2);
    instances.authMethod.authorized_collection_actions.accounts = [];
    await visit(urls.authMethod);
    assert.notOk(
      instances.authMethod.authorized_collection_actions.accounts.includes(
        'list'
      )
    );
    assert.notOk(find(`[href="${urls.accounts}"]`));
  });

  test('User can navigate to index with only create action', async function (assert) {
    assert.expect(2);
    instances.authMethod.authorized_collection_actions.accounts = ['create'];
    await visit(urls.authMethod);
    assert.ok(find(`[href="${urls.accounts}"]`));
    assert.ok(find(`.rose-layout-page-actions [href="${urls.newAccount}"]`));
  });
});
