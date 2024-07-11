/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | accounts | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const ACCOUNT_SELECTOR = 'main tbody .hds-table__td:nth-child(1) a';

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
    urls.account = `${urls.accounts}/${instances.account.id}`;
  });

  hooks.afterEach(async function () {
    const notification = find('.rose-notification');
    if (notification) {
      await click('.rose-notification-dismiss');
    }
  });

  test('can navigate to an account form', async function (assert) {
    await visit(urls.accounts);
    await click(ACCOUNT_SELECTOR);

    await a11yAudit();
    assert.strictEqual(currentURL(), urls.account);
  });

  test('cannot navigate to an account form without proper authorization', async function (assert) {
    instances.account.authorized_actions =
      instances.account.authorized_actions.filter((item) => item !== 'read');
    await visit(urls.accounts);
    assert.dom(ACCOUNT_SELECTOR).doesNotExist();
  });

  test('user can navigate to account and incorrect url autocorrects', async function (assert) {
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
