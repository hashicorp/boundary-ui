/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import {
  authenticateSession,
  invalidateSession,
} from 'ember-simple-auth/test-support';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | accounts | change password', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    account: null,
  };
  const urls = {
    orgScope: null,
    changePassword: null,
  };

  hooks.beforeEach(async function () {
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
    });
    await authenticateSession({
      account_id: instances.account.id,
      username: 'admin',
    });
    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.changePassword = `/account/change-password`;
  });

  test('visiting account change password', async function (assert) {
    await visit(urls.orgScope);

    await click(commonSelectors.SIDEBAR_USER_DROPDOWN);
    await click(commonSelectors.HREF(urls.changePassword));
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.changePassword);
  });

  test('can change password for account', async function (assert) {
    assert.expect(2);
    // TODO: address issue with ICU-15021
    // Failing due to a11y violation while in dark mode.
    // Investigating issue with styles not properly
    // being applied during test.
    const session = this.owner.lookup('service:session');
    session.set('data.theme', 'light');
    this.server.post(
      '/accounts/:idMethod',
      (_, { params: { idMethod }, requestBody }) => {
        const attrs = JSON.parse(requestBody);
        assert.strictEqual(
          attrs.current_password,
          'current password',
          'current password is provided',
        );
        assert.strictEqual(
          attrs.new_password,
          'new password',
          'new password is provided',
        );
        const id = idMethod.split(':')[0];
        return { id };
      },
    );
    await visit(urls.changePassword);

    await fillIn(
      selectors.FIELD_CURRENT_PASSWORD,
      selectors.FIELD_CURRENT_PASSWORD_VALUE,
    );
    await fillIn(
      selectors.FIELD_NEW_PASSWORD,
      selectors.FIELD_NEW_PASSWORD_VALUE,
    );
    await click(commonSelectors.SAVE_BTN);

    await a11yAudit();
  });

  test('can cancel password change', async function (assert) {
    await visit(urls.changePassword);

    await fillIn(
      selectors.FIELD_CURRENT_PASSWORD,
      selectors.FIELD_CURRENT_PASSWORD_VALUE,
    );
    await fillIn(
      selectors.FIELD_NEW_PASSWORD,
      selectors.FIELD_NEW_PASSWORD_VALUE,
    );
    await click(commonSelectors.CANCEL_BTN);

    assert.notEqual(currentURL(), urls.changePassword);
  });

  test('errors are displayed when changing password fails', async function (assert) {
    this.server.post('/accounts/:id', () => {
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
    await visit(urls.orgScope);

    await click(commonSelectors.SIDEBAR_USER_DROPDOWN);
    await click(commonSelectors.HREF(urls.changePassword));
    await fillIn(
      selectors.FIELD_CURRENT_PASSWORD,
      selectors.FIELD_CURRENT_PASSWORD_VALUE,
    );
    await fillIn(
      selectors.FIELD_NEW_PASSWORD,
      selectors.FIELD_NEW_PASSWORD_VALUE,
    );
    await click(commonSelectors.SAVE_BTN);
    await a11yAudit();

    assert.dom(commonSelectors.ALERT_TOAST).isVisible();
  });

  test('cannot change password when not authenticated', async function (assert) {
    await invalidateSession();

    await visit(urls.changePassword);

    assert.notEqual(currentURL(), urls.changePassword);
  });
});
