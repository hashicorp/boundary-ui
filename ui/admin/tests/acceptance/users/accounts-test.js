/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
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
import { TYPE_AUTH_METHOD_LDAP } from 'api/models/auth-method';

module('Acceptance | users | accounts', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let accountsCount;

  const ACCOUNTS_ACTION_SELECTOR =
    'tbody .rose-table-row:nth-child(1) .rose-table-cell:last-child .rose-dropdown';
  const ACCOUNTS_TYPE_SELECTOR =
    'tbody .rose-table-row:nth-child(1) .rose-table-cell';
  const ADD_ACCOUNTS_ACTION_SELECTOR = '.rose-layout-page-actions a';
  const ERROR_MSG_SELECTOR = '[role="alert"]';
  const TABLE_SELECTOR = '.rose-table';
  const TABLE_ROWS_SELECTOR = 'tbody tr';
  const CHECKBOX_SELECTOR = 'tbody label';
  const SUBMIT_BTN_SELECTOR = 'form [type="submit"]';
  const CANCEL_BTN_SELECTOR = 'form [type="button"]';
  const REMOVE_ACTION_SELECTOR = 'tbody tr .rose-dropdown-button-danger';

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    user: null,
    globalUser: null,
  };

  const urls = {
    globalScope: null,
    users: null,
    user: null,
    globalUser: null,
    accounts: null,
    ldapAccounts: null,
    addAccounts: null,
  };

  hooks.beforeEach(function () {
    authenticateSession({});
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    this.server.create(
      'auth-method',
      {
        scope: instances.scopes.org,
      },
      'withAccountsAndUsersAndManagedGroups'
    );
    this.server.create(
      'auth-method',
      {
        scope: instances.scopes.global,
        type: TYPE_AUTH_METHOD_LDAP,
      },
      'withAccountsAndUsersAndManagedGroups'
    );
    instances.user = this.server.schema.users.first();
    instances.globalUser = this.server.schema.users.findBy({
      scopeId: 'global',
    });
    accountsCount = instances.user.accountIds.length;
    urls.globalScope = `/scopes/global`;
    urls.users = `/scopes/${instances.scopes.org.id}/users`;
    urls.user = `${urls.users}/${instances.user.id}`;
    urls.globalUser = `${urls.globalScope}/users/${instances.globalUser.id}`;
    urls.accounts = `${urls.user}/accounts`;
    urls.ldapAccounts = `${urls.globalUser}/accounts`;
    urls.addAccounts = `${urls.user}/add-accounts`;
  });

  test('visiting user accounts', async function (assert) {
    assert.expect(2);
    await visit(urls.user);

    await click(`[href="${urls.accounts}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.accounts);
    assert.dom(TABLE_ROWS_SELECTOR).exists({ count: accountsCount });
  });

  test('can remove an account', async function (assert) {
    assert.expect(2);
    await visit(urls.user);

    await click(`[href="${urls.accounts}"]`);
    assert.dom(TABLE_ROWS_SELECTOR).exists({ count: accountsCount });
    await click(REMOVE_ACTION_SELECTOR);
    assert.dom(TABLE_ROWS_SELECTOR).exists({ count: accountsCount - 1 });
  });

  test('cannot remove an account without proper authorization', async function (assert) {
    assert.expect(1);
    const authorized_actions = instances.user.authorized_actions.filter(
      (item) => item !== 'remove-accounts'
    );
    instances.user.update({ authorized_actions });
    await visit(urls.user);

    await click(`[href="${urls.accounts}"]`);

    assert.dom(REMOVE_ACTION_SELECTOR).doesNotExist();
  });

  test('cannot remove an ldap account', async function (assert) {
    assert.expect(2);
    await visit(urls.globalUser);

    await click(`[href="${urls.ldapAccounts}"]`);

    assert.dom(ACCOUNTS_ACTION_SELECTOR).doesNotExist();
    assert.dom(ACCOUNTS_TYPE_SELECTOR).hasText('LDAP');
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
    await visit(urls.user);

    await click(`[href="${urls.accounts}"]`);
    assert.dom(TABLE_ROWS_SELECTOR).exists({ count: accountsCount });
    await click(REMOVE_ACTION_SELECTOR);
    assert.dom(ERROR_MSG_SELECTOR).isVisible();
  });

  test('visiting account add accounts', async function (assert) {
    assert.expect(1);
    await visit(urls.accounts);

    await click(ADD_ACCOUNTS_ACTION_SELECTOR);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.addAccounts);
  });

  test('can navigate to add accounts with proper authorization', async function (assert) {
    assert.expect(1);
    await visit(urls.user);

    await click(`[href="${urls.accounts}"]`);

    assert.dom(`[href="${urls.addAccounts}"]`).exists();
  });

  test('cannot navigate to add accounts without proper authorization', async function (assert) {
    assert.expect(1);
    const authorized_actions = instances.user.authorized_actions.filter(
      (item) => item !== 'add-accounts'
    );
    instances.user.update({ authorized_actions });
    await visit(urls.user);

    await click(`[href="${urls.accounts}"]`);
    assert.dom(ADD_ACCOUNTS_ACTION_SELECTOR).doesNotExist();
  });

  test('cannot add ldap accounts to user since they were filtered out', async function (assert) {
    assert.expect(1);
    await visit(urls.globalUser);

    await click(`[href="${urls.ldapAccounts}"]`);
    await click(ADD_ACCOUNTS_ACTION_SELECTOR);

    assert.dom(TABLE_SELECTOR).doesNotExist();
  });

  test('select and save accounts to add', async function (assert) {
    assert.expect(4);
    instances.user.update({ accountIds: [] });
    await visit(urls.user);

    await click(`[href="${urls.accounts}"]`);
    assert.dom(TABLE_ROWS_SELECTOR).exists({ count: 0 });
    await click(ADD_ACCOUNTS_ACTION_SELECTOR);
    assert.strictEqual(currentURL(), urls.addAccounts);
    // Click three times to select, unselect, then reselect (for coverage)
    await click(CHECKBOX_SELECTOR);
    await click(CHECKBOX_SELECTOR);
    await click(CHECKBOX_SELECTOR);
    await click(SUBMIT_BTN_SELECTOR);
    await visit(urls.accounts);

    assert.dom(TABLE_ROWS_SELECTOR).exists({ count: 1 });
    assert.strictEqual(instances.user.accountIds.length, 1);
  });

  test('select and cancel accounts to add', async function (assert) {
    assert.expect(4);
    await visit(urls.user);

    await click(`[href="${urls.accounts}"]`);
    assert.dom(TABLE_ROWS_SELECTOR).exists({ count: accountsCount });
    await click(REMOVE_ACTION_SELECTOR);
    assert.dom(TABLE_ROWS_SELECTOR).exists({ count: accountsCount - 1 });
    await click(ADD_ACCOUNTS_ACTION_SELECTOR);
    assert.strictEqual(currentURL(), urls.addAccounts);
    await click(CHECKBOX_SELECTOR);
    await click(CANCEL_BTN_SELECTOR);
    await visit(urls.accounts);
    assert.dom(TABLE_ROWS_SELECTOR).exists({ count: accountsCount - 1 });
  });

  test('shows error message on account add', async function (assert) {
    assert.expect(1);
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
    instances.user.update({ accountIds: [] });
    await visit(urls.addAccounts);
    await click(CHECKBOX_SELECTOR);
    await click(SUBMIT_BTN_SELECTOR);
    assert.dom(ERROR_MSG_SELECTOR).isVisible();
  });
});
