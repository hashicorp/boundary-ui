/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | accounts | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    authMethod: null,
    account: null,
  };
  const urls = {
    orgScope: null,
    authMethod: null,
    accounts: null,
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
    urls.authMethod = `${urls.orgScope}/auth-methods/${instances.authMethod.id}`;
    urls.accounts = `${urls.authMethod}/accounts`;
    urls.account = `${urls.accounts}/${instances.account.id}`;
  });

  test('can navigate to an account form', async function (assert) {
    await visit(urls.accounts);
    await click(commonSelectors.TABLE_RESOURCE_LINK(urls.account));

    assert.strictEqual(currentURL(), urls.account);
  });

  test('cannot navigate to an account form without proper authorization', async function (assert) {
    instances.account.authorized_actions =
      instances.account.authorized_actions.filter((item) => item !== 'read');
    await visit(urls.accounts);

    assert
      .dom(commonSelectors.TABLE_RESOURCE_LINK(urls.account))
      .doesNotExist();
  });

  test('user can navigate to account and incorrect url auto-corrects', async function (assert) {
    const authMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
    });
    const account = this.server.create('account', {
      scope: instances.scopes.org,
      authMethod,
    });
    const incorrectUrl = `${urls.accounts}/${account.id}`;
    const correctUrl = `${urls.orgScope}/auth-methods/${authMethod.id}/accounts/${account.id}`;

    await visit(incorrectUrl);

    assert.notEqual(currentURL(), incorrectUrl);
    assert.strictEqual(currentURL(), correctUrl);
  });
});
