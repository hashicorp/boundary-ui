/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | accounts | delete', function (hooks) {
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
    authMethods: null,
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
    urls.authMethods = `${urls.orgScope}/auth-methods`;
    urls.authMethod = `${urls.authMethods}/${instances.authMethod.id}`;
    urls.accounts = `${urls.authMethod}/accounts`;
    urls.account = `${urls.accounts}/${instances.account.id}`;
  });

  hooks.afterEach(async function () {
    const notification = find(commonSelectors.ALERT_TOAST);
    if (notification) {
      await click(commonSelectors.ALERT_TOAST_DISMISS);
    }
  });

  test('can delete an account', async function (assert) {
    const accountsCount = this.server.schema.accounts.all().models.length;
    await visit(urls.account);

    await click(selectors.MANAGE_DROPDOWN_ACCOUNT);
    await click(selectors.MANAGE_DROPDOWN_DELETE_ACCOUNT);

    assert.strictEqual(
      this.server.schema.accounts.all().models.length,
      accountsCount - 1,
    );
  });

  test('cannot delete an account without proper authorization', async function (assert) {
    instances.account.authorized_actions =
      instances.account.authorized_actions.filter((item) => item !== 'delete');

    await visit(urls.account);

    assert.dom(selectors.MANAGE_DROPDOWN_ACCOUNT).doesNotExist();
  });

  test('errors are displayed when delete on account fails', async function (assert) {
    this.server.del('/accounts/:id', () => {
      return new Response(
        490,
        {},
        {
          status: 490,
          code: 'error',
          message: 'Oops.',
        },
      );
    });
    await visit(urls.account);

    await click(selectors.MANAGE_DROPDOWN_ACCOUNT);
    await click(selectors.MANAGE_DROPDOWN_DELETE_ACCOUNT);

    await a11yAudit();
    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText('Oops.');
  });
});
