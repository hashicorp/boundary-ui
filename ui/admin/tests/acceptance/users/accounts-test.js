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
  let features;

  const ACCOUNTS_ACTION_SELECTOR =
    'tbody .rose-table-row:nth-child(1) .rose-table-cell:last-child .rose-dropdown';
  const ACCOUNTS_TYPE_SELECTOR =
    'tbody .rose-table-row:nth-child(1) .rose-table-cell';
  const ADD_ACCOUNTS_ACTION_SELECTOR = '.rose-layout-page-actions a';
  const ERROR_MSG_SELECTOR = '[role="alert"]';
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
  };

  const urls = {
    users: null,
    user: null,
    accounts: null,
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
    instances.user = this.server.schema.users.first();
    accountsCount = instances.user.accountIds.length;
    urls.users = `/scopes/${instances.scopes.org.id}/users`;
    urls.user = `${urls.users}/${instances.user.id}`;
    urls.accounts = `${urls.user}/accounts`;
    urls.addAccounts = `${urls.user}/add-accounts`;

    features = this.owner.lookup('service:features');
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

  test('cannot remove an ldap account when feature flag disabled', async function (assert) {
    assert.expect(2);
    const authMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
      type: TYPE_AUTH_METHOD_LDAP,
    });
    const { id } = this.server.create('account', {
      scope: instances.scopes.org,
      type: TYPE_AUTH_METHOD_LDAP,
      authMethod,
    });
    instances.user.update({ accountIds: [id] });
    await visit(urls.user);

    await click(`[href="${urls.accounts}"]`);

    assert.dom(ACCOUNTS_ACTION_SELECTOR).doesNotExist();
    assert.dom(ACCOUNTS_TYPE_SELECTOR).hasText('LDAP');
  });

  test('can remove an ldap account when feature flag enabled', async function (assert) {
    assert.expect(2);
    features.enable('ldap-auth-methods');
    const authMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
      type: TYPE_AUTH_METHOD_LDAP,
    });
    const { id } = this.server.create('account', {
      scope: instances.scopes.org,
      type: TYPE_AUTH_METHOD_LDAP,
      authMethod,
    });
    instances.user.update({ accountIds: [id] });
    await visit(urls.user);

    await click(`[href="${urls.accounts}"]`);

    assert.dom(ACCOUNTS_ACTION_SELECTOR).exists();
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

  test('cannot add ldap accounts to user when feature flag is disabled', async function (assert) {
    assert.expect(1);
    const authMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
      type: TYPE_AUTH_METHOD_LDAP,
    });
    this.server.create('account', {
      scope: instances.scopes.org,
      type: TYPE_AUTH_METHOD_LDAP,
      authMethod,
    });
    const accountsAvailableCount =
      this.server.schema.accounts.all().length -
      instances.user.accountIds.length;
    await visit(urls.user);

    await click(`[href="${urls.accounts}"]`);
    await click(ADD_ACCOUNTS_ACTION_SELECTOR);

    assert
      .dom(TABLE_ROWS_SELECTOR)
      .exists({ count: accountsAvailableCount - 1 });
  });

  test('can add ldap accounts to user when feature flag is enabled', async function (assert) {
    assert.expect(1);
    features.enable('ldap-auth-methods');
    const authMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
      type: TYPE_AUTH_METHOD_LDAP,
    });
    this.server.create('account', {
      scope: instances.scopes.org,
      type: TYPE_AUTH_METHOD_LDAP,
      authMethod,
    });
    const accountsAvailableCount =
      this.server.schema.accounts.all().length -
      instances.user.accountIds.length;
    await visit(urls.user);

    await click(`[href="${urls.accounts}"]`);
    await click(ADD_ACCOUNTS_ACTION_SELECTOR);

    assert.dom(TABLE_ROWS_SELECTOR).exists({ count: accountsAvailableCount });
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
