/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, find, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | accounts | create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    authMethods: null,
    authMethod: null,
    account: null,
  };
  const urls = {
    orgScope: null,
    authMethods: null,
    authMethod: null,
    accounts: null,
    newAccount: null,
    account: null,
  };

  hooks.beforeEach(async function () {
    await authenticateSession({ username: 'admin' });
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
    const notification = find(commonSelectors.ALERT_TOAST);
    if (notification) {
      await click(commonSelectors.ALERT_TOAST_DISMISS);
    }
  });

  test('visiting accounts', async function (assert) {
    await visit(urls.accounts);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.accounts);
  });

  test('can create a new account', async function (assert) {
    const accountsCount = this.server.schema.accounts.all().models.length;
    await visit(urls.newAccount);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await fillIn(
      commonSelectors.FIELD_DESCRIPTION,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );
    await fillIn(selectors.FIELD_LOGIN_NAME, selectors.FIELD_LOGIN_NAME_VALUE);
    await fillIn(
      commonSelectors.FIELD_PASSWORD,
      commonSelectors.FIELD_PASSWORD_VALUE,
    );
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(
      this.server.schema.accounts.all().models.length,
      accountsCount + 1,
    );
  });

  test('can create a new LDAP account', async function (assert) {
    const accountsCount = this.server.schema.accounts.all().models.length;
    await visit(urls.newAccount);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await fillIn(
      commonSelectors.FIELD_DESCRIPTION,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );
    await fillIn(selectors.FIELD_LOGIN_NAME, selectors.FIELD_LOGIN_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(
      this.server.schema.accounts.all().models.length,
      accountsCount + 1,
    );
  });

  test('Users cannot create a new account without proper authorization', async function (assert) {
    instances.authMethod.authorized_collection_actions.accounts = [];
    await visit(urls.authMethod);

    await click(selectors.MANAGE_DROPDOWN_AUTH_METHOD);

    assert.notOk(
      instances.authMethod.authorized_collection_actions.accounts.includes(
        'create',
      ),
    );
    assert.dom(commonSelectors.HREF(urls.newAccount)).doesNotExist();
  });

  test('Users can navigate to new account route with proper authorization', async function (assert) {
    await visit(urls.accounts);

    await click(selectors.MANAGE_DROPDOWN_AUTH_METHOD);

    assert.ok(
      instances.authMethod.authorized_collection_actions.accounts.includes(
        'create',
      ),
    );
    assert.dom(commonSelectors.HREF(urls.newAccount)).isVisible();
  });

  test('Users cannot navigate to new account route without proper authorization', async function (assert) {
    instances.authMethod.authorized_collection_actions.accounts = [];
    await visit(urls.accounts);

    await click(selectors.MANAGE_DROPDOWN_AUTH_METHOD);

    assert.notOk(
      instances.authMethod.authorized_collection_actions.accounts.includes(
        'create',
      ),
    );
    assert.dom(commonSelectors.HREF(urls.newAccount)).doesNotExist();
  });

  test('can cancel a new account creation', async function (assert) {
    const accountsCount = this.server.schema.accounts.all().models.length;
    await visit(urls.newAccount);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.accounts);
    assert.strictEqual(
      this.server.schema.accounts.all().models.length,
      accountsCount,
    );
  });

  test('can cancel a new LDAP account creation', async function (assert) {
    const accountsCount = this.server.schema.accounts.all().models.length;
    await visit(urls.newAccount);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.accounts);
    assert.strictEqual(
      this.server.schema.accounts.all().models.length,
      accountsCount,
    );
  });

  test('saving a new account with invalid fields displays error messages', async function (assert) {
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
        },
      );
    });
    await visit(urls.newAccount);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN);

    await a11yAudit();
    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
    assert.dom(commonSelectors.FIELD_NAME_ERROR).hasText('Name is required.');
  });

  test('users cannot directly navigate to new account route without proper authorization', async function (assert) {
    instances.authMethod.authorized_collection_actions.accounts =
      instances.authMethod.authorized_collection_actions.accounts.filter(
        (item) => item !== 'create',
      );

    await visit(urls.newAccount);

    assert.false(
      instances.authMethod.authorized_collection_actions.accounts.includes(
        'create',
      ),
    );
    assert.strictEqual(currentURL(), urls.accounts);
  });
});
