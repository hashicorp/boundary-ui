/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { Response } from 'miragejs';
import {
  TYPE_AUTH_METHOD_PASSWORD,
  TYPE_AUTH_METHOD_LDAP,
  TYPE_AUTH_METHOD_OIDC,
} from 'api/models/auth-method';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | users | accounts', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  let accountsCount;
  let features;

  const instances = {
    scopes: {
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

  hooks.beforeEach(async function () {
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.authMethod = this.server.create(
      'auth-method',
      {
        scope: instances.scopes.org,
        type: TYPE_AUTH_METHOD_PASSWORD,
      },
      'withAccountsAndUsersAndManagedGroups',
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
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.user);

    await click(commonSelectors.HREF(urls.accounts));

    assert.strictEqual(currentURL(), urls.accounts);
    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: accountsCount });
  });

  test('can remove an account', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.user);

    await click(commonSelectors.HREF(urls.accounts));

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: accountsCount });

    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);
    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_BTN);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: accountsCount - 1 });
  });

  test('cannot remove an account without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const authorized_actions = instances.user.authorized_actions.filter(
      (item) => item !== 'remove-accounts',
    );
    instances.user.update({ authorized_actions });
    await visit(urls.user);

    await click(commonSelectors.HREF(urls.accounts));

    assert
      .dom(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_BTN)
      .doesNotExist();
  });

  test('cannot remove an ldap account when feature flag disabled', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

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

    await click(commonSelectors.HREF(urls.accounts));

    assert.dom(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN).doesNotExist();
    assert.dom(selectors.TABLE_ROW_ACCOUNT_TYPE).hasText('LDAP');
  });

  test('can remove an ldap account when feature flag enabled', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

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

    await click(commonSelectors.HREF(urls.accounts));

    assert.dom(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN).exists();
    assert.dom(selectors.TABLE_ROW_ACCOUNT_TYPE).hasText('LDAP');
  });

  test('shows error message on account remove', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.server.post('/users/:idMethod', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {},
        },
      );
    });
    await visit(urls.user);

    await click(commonSelectors.HREF(urls.accounts));

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: accountsCount });

    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);
    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_BTN);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).isVisible();
  });

  test('visiting account add accounts', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.accounts);

    await click(selectors.MANAGE_DROPDOWN_USER);
    await click(selectors.MANAGE_DROPDOWN_USER_ADD_ACCOUNTS);

    assert.strictEqual(currentURL(), urls.addAccounts);
  });

  test('can navigate to add accounts with proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.user);

    await click(commonSelectors.HREF(urls.accounts));
    await click(selectors.MANAGE_DROPDOWN_USER);

    assert.dom(commonSelectors.HREF(urls.addAccounts)).isVisible();
  });

  test('cannot navigate to add accounts without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const authorized_actions = instances.user.authorized_actions.filter(
      (item) => item !== 'add-accounts',
    );
    instances.user.update({ authorized_actions });
    await visit(urls.user);

    await click(commonSelectors.HREF(urls.accounts));

    assert.dom(selectors.MANAGE_DROPDOWN_USER_ADD_ACCOUNTS).doesNotExist();
  });

  test('cannot add ldap accounts to user when feature flag is disabled', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

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
      this.server.schema.accounts.where({ scopeId: instances.scopes.org.id })
        .length - instances.user.accountIds.length;
    await visit(urls.user);

    await click(commonSelectors.HREF(urls.accounts));
    await click(selectors.MANAGE_DROPDOWN_USER);
    await click(selectors.MANAGE_DROPDOWN_USER_ADD_ACCOUNTS);

    assert
      .dom(commonSelectors.TABLE_ROWS)
      .exists({ count: accountsAvailableCount - 1 });
  });

  test('can add ldap accounts to user when feature flag is enabled', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

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
      this.server.schema.accounts.where({ scopeId: instances.scopes.org.id })
        .length - instances.user.accountIds.length;
    await visit(urls.user);

    await click(commonSelectors.HREF(urls.accounts));
    await click(selectors.MANAGE_DROPDOWN_USER);
    await click(selectors.MANAGE_DROPDOWN_USER_ADD_ACCOUNTS);

    assert
      .dom(commonSelectors.TABLE_ROWS)
      .exists({ count: accountsAvailableCount });
  });

  test('select and save accounts to add', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.user.update({ accountIds: [] });
    await visit(urls.user);

    await click(commonSelectors.HREF(urls.accounts));

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 0 });

    await click(selectors.MANAGE_DROPDOWN_USER);
    await click(selectors.MANAGE_DROPDOWN_USER_ADD_ACCOUNTS);

    assert.strictEqual(currentURL(), urls.addAccounts);

    // Click three times to select, unselect, then reselect (for coverage)
    await click(commonSelectors.TABLE_ROW_CHECKBOX);
    await click(commonSelectors.TABLE_ROW_CHECKBOX);
    await click(commonSelectors.TABLE_ROW_CHECKBOX);
    await click(commonSelectors.SAVE_BTN);
    await visit(urls.accounts);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 1 });
    assert.strictEqual(instances.user.accountIds.length, 1);
  });

  test('select and cancel accounts to add', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.user);

    await click(commonSelectors.HREF(urls.accounts));

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: accountsCount });

    await click(selectors.MANAGE_DROPDOWN_USER);
    await click(selectors.MANAGE_DROPDOWN_USER_ADD_ACCOUNTS);

    assert.strictEqual(currentURL(), urls.addAccounts);

    await click(commonSelectors.TABLE_ROW_CHECKBOX);
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.accounts);
    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: accountsCount });
  });

  test('shows error message on account add', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.server.post('/users/:idMethod', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {},
        },
      );
    });
    instances.user.update({ accountIds: [] });
    await visit(urls.addAccounts);

    await click(commonSelectors.TABLE_ROW_CHECKBOX);
    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).isVisible();
  });

  test('can navigate to account link for password account', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.user);
    await click(commonSelectors.HREF(urls.accounts));

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: accountsCount });
    assert
      .dom(
        commonSelectors.TABLE_RESOURCE_LINK(
          `/scopes/${instances.scopes.org.id}/auth-methods/${instances.authMethod.id}/accounts/${instances.user.accountIds[0]}`,
        ),
      )
      .exists({ count: accountsCount });
  });

  test('can navigate to account link for oidc account', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.server.schema.users.all().destroy();

    const authMethod = this.server.create(
      'auth-method',
      {
        scope: instances.scopes.org,
        type: TYPE_AUTH_METHOD_OIDC,
      },
      'withAccountsAndUsersAndManagedGroups',
    );
    const user = this.server.schema.users.first();
    const count = user.accountIds.length;

    await visit(`${urls.users}/${user.id}`);
    await click(commonSelectors.HREF(`${urls.users}/${user.id}/accounts`));

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count });
    assert
      .dom(
        commonSelectors.TABLE_RESOURCE_LINK(
          `/scopes/${instances.scopes.org.id}/auth-methods/${authMethod.id}/accounts/${user.accountIds[0]}`,
        ),
      )
      .exists({ count });
  });

  test('can navigate to account link for ldap account', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.server.schema.users.all().destroy();

    const authMethod = this.server.create(
      'auth-method',
      {
        scope: instances.scopes.org,
        type: TYPE_AUTH_METHOD_LDAP,
      },
      'withAccountsAndUsersAndManagedGroups',
    );
    const user = this.server.schema.users.first();
    const count = user.accountIds.length;

    await visit(`${urls.users}/${user.id}`);
    await click(commonSelectors.HREF(`${urls.users}/${user.id}/accounts`));

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count });
    assert
      .dom(
        commonSelectors.TABLE_RESOURCE_LINK(
          `/scopes/${instances.scopes.org.id}/auth-methods/${authMethod.id}/accounts/${user.accountIds[0]}`,
        ),
      )
      .exists({ count });
  });
});
