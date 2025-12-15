/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { Response } from 'miragejs';
import { invalidateSession } from 'ember-simple-auth/test-support';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | accounts | change password', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  const instances = {
    scopes: {
      org: null,
    },
    account: null,
  };
  const urls = {
    orgScope: null,
    changePassword: null,
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
    });

    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.changePassword = `/account/change-password`;
  });

  test('visiting account change password', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.orgScope);

    await click(commonSelectors.SIDEBAR_USER_DROPDOWN);
    await click(commonSelectors.HREF(urls.changePassword));

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
  });

  test('can cancel password change', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

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
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

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

    assert.dom(commonSelectors.ALERT_TOAST).isVisible();
  });

  test('cannot change password when not authenticated', async function (assert) {
    await invalidateSession();

    await visit(urls.changePassword);

    assert.notEqual(currentURL(), urls.changePassword);
  });
});
