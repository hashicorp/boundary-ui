import { module, test } from 'qunit';
import { visit, currentURL, click, find, findAll } from '@ember/test-helpers';
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

module('Acceptance | users | accounts', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    user: null,
  };
  const urls = {
    orgScope: null,
    users: null,
    user: null,
    accounts: null,
    addAccounts: null,
  };
  let accountsCount;

  hooks.beforeEach(function () {
    authenticateSession({});
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    this.server.create('auth-method', {
      scope: instances.scopes.org
    }, 'withAccountsAndUsers');
    instances.user = this.server.db.users[0];
    accountsCount = instances.user.accountIds.length;
    urls.users = `/scopes/${instances.scopes.org.id}/users`;
    urls.user = `${urls.users}/${instances.user.id}`;
    urls.accounts = `${urls.user}/accounts`;
    urls.addAccounts = `${urls.user}/add-accounts`;
  });

  test('visiting user accounts', async function (assert) {
    assert.expect(2);
    await visit(urls.accounts);
    await a11yAudit();
    assert.equal(currentURL(), urls.accounts);
    assert.equal(findAll('tbody tr').length, accountsCount);
  });

  test('can remove a account', async function (assert) {
    assert.expect(2);
    await visit(urls.accounts);
    assert.equal(findAll('tbody tr').length, accountsCount);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.equal(findAll('tbody tr').length, accountsCount - 1);
  });

  test('shows error message on account remove', async function (assert) {
    assert.expect(2);
    this.server.post('/users/:idMethod', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {},
        }
      );
    });
    await visit(urls.accounts);
    assert.equal(findAll('tbody tr').length, accountsCount);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.ok(find('[role="alert"]'));
  });

  // test('visiting account add accounts', async function(assert) {
  //   assert.expect(1);
  //   await visit(urls.addAccounts);
  //   await a11yAudit();
  //   assert.equal(currentURL(), urls.addAccounts);
  // });
  //
  // test('select and save accounts to add', async function (assert) {
  //   assert.expect(3);
  //   instances.user.update({ accountIds: [] });
  //   await visit(urls.accounts);
  //   assert.equal(findAll('tbody tr').length, 0);
  //   await click('.rose-layout-page-actions a')
  //   assert.equal(currentURL(), urls.addAccounts);
  //   await click('tbody label');
  //   await click('form [type="submit"]');
  //   await visit(urls.accounts);
  //   assert.equal(findAll('tbody tr').length, 1);
  // });
  //
  // test('select and cancel accounts to add', async function (assert) {
  //   assert.expect(4);
  //   await visit(urls.accounts);
  //   assert.equal(findAll('tbody tr').length, accountsCount);
  //   await click('tbody tr .rose-dropdown-button-danger');
  //   assert.equal(findAll('tbody tr').length, accountsCount - 1);
  //   await click('.rose-layout-page-actions a')
  //   assert.equal(currentURL(), urls.addAccounts);
  //   await click('tbody label');
  //   await click('form [type="button"]');
  //   await visit(urls.accounts);
  //   assert.equal(findAll('tbody tr').length, accountsCount - 1);
  // });
  //
  // test('shows error message on account add', async function (assert) {
  //   assert.expect(1);
  //   this.server.post('/users/:idMethod', () => {
  //     return new Response(
  //       400,
  //       {},
  //       {
  //         status: 400,
  //         code: 'invalid_argument',
  //         message: 'The request was invalid.',
  //         details: {},
  //       }
  //     );
  //   });
  //   instances.user.update({ accountIds: [] });
  //   await visit(urls.addAccounts);
  //   await click('tbody label');
  //   await click('form [type="submit"]');
  //   assert.ok(find('[role="alert"]'));
  // });
});
