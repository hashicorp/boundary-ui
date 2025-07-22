/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | accounts | set password', function (hooks) {
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
    account: null,
    setPassword: null,
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
    urls.account = `${urls.authMethod}/accounts/${instances.account.id}`;
    urls.setPassword = `${urls.account}/set-password`;
  });

  test('visiting account set password', async function (assert) {
    await visit(urls.setPassword);

    assert.strictEqual(currentURL(), urls.setPassword);
  });

  test('can navigate to route with proper authorization', async function (assert) {
    await visit(urls.account);

    assert.dom(commonSelectors.HREF(urls.setPassword)).isVisible();
  });

  test('cannot navigate to route without proper authorization', async function (assert) {
    const authorized_actions = instances.account.authorized_actions.filter(
      (item) => item !== 'set-password',
    );
    instances.account.update({ authorized_actions });

    await visit(urls.account);

    assert.dom(commonSelectors.HREF(urls.setPassword)).doesNotExist();
  });

  test('can set a new password for account', async function (assert) {
    assert.expect(1);
    this.server.post(
      '/accounts/:idMethod',
      (_, { params: { idMethod }, requestBody }) => {
        const attrs = JSON.parse(requestBody);
        assert.strictEqual(
          attrs.password,
          'update password',
          'new password is set',
        );
        const id = idMethod.split(':')[0];
        return { id };
      },
    );

    await visit(urls.setPassword);

    await fillIn(commonSelectors.FIELD_PASSWORD, 'update password');
    await click(commonSelectors.SAVE_BTN);
  });

  test('can cancel setting new password by navigating away', async function (assert) {
    await visit(urls.setPassword);

    await fillIn(
      commonSelectors.FIELD_PASSWORD,
      commonSelectors.FIELD_PASSWORD_VALUE,
    );
    await click(commonSelectors.HREF(urls.account));

    assert.strictEqual(currentURL(), urls.account);
  });

  test('errors are displayed when setting password fails', async function (assert) {
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

    await visit(urls.setPassword);
    await fillIn(
      commonSelectors.FIELD_PASSWORD,
      commonSelectors.FIELD_PASSWORD_VALUE,
    );
    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.ALERT_TOAST).isVisible();
  });
});
