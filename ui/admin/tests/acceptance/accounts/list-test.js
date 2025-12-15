/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | accounts | list', function (hooks) {
  setupApplicationTest(hooks);

  const instances = {
    scopes: {
      org: null,
    },
    authMethod: null,
    account: null,
  };
  const urls = {
    orgScope: null,
    authMethod: null,
    accounts: null,
    newAccount: null,
    account: null,
  };

  hooks.beforeEach(async function () {
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
    urls.authMethod = `${urls.orgScope}/auth-methods/${instances.authMethod.id}`;
    urls.accounts = `${urls.authMethod}/accounts`;
    urls.newAccount = `${urls.accounts}/new`;
    urls.account = `${urls.accounts}/${instances.account.id}`;
  });

  test('Users can navigate to accounts with proper authorization', async function (assert) {
    await visit(urls.authMethod);

    assert.ok(
      instances.authMethod.authorized_collection_actions.accounts.includes(
        'list',
      ),
    );
    assert.dom(commonSelectors.HREF(urls.accounts)).isVisible();
  });

  test('User cannot navigate to index without either list or create actions', async function (assert) {
    instances.authMethod.authorized_collection_actions.accounts = [];
    await visit(urls.authMethod);

    assert.notOk(
      instances.authMethod.authorized_collection_actions.accounts.includes(
        'list',
      ),
    );
    assert.dom(commonSelectors.HREF(urls.accounts)).doesNotExist();
  });

  test('User can navigate to index with only create action', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.authMethod.authorized_collection_actions.accounts = ['create'];
    await visit(urls.authMethod);

    assert.dom(commonSelectors.HREF(urls.accounts)).isVisible();
    await click(selectors.MANAGE_DROPDOWN_AUTH_METHOD);
    assert
      .dom(selectors.MANAGE_DROPDOWN_CREATE_ACCOUNT)
      .hasAttribute('href', urls.newAccount);
  });
});
