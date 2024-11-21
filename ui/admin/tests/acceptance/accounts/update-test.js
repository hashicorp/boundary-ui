/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | accounts | update', function (hooks) {
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

  hooks.beforeEach(function () {
    authenticateSession({ username: 'admin' });
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

  test('can update resource and save changes', async function (assert) {
    await visit(urls.account);

    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, 'updated name');
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(
      this.server.schema.accounts.all().models[0].name,
      'updated name',
    );
  });

  test('can update resource and save LDAP account changes', async function (assert) {
    await visit(urls.account);

    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, 'updated name');
    await fillIn(commonSelectors.FIELD_DESCRIPTION, 'updated desc');
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(
      this.server.schema.accounts.all().models[0].name,
      'updated name',
    );
    assert.strictEqual(
      this.server.schema.accounts.all().models[0].description,
      'updated desc',
    );
  });

  test('cannot update resource without proper authorization', async function (assert) {
    instances.account.authorized_actions =
      instances.account.authorized_actions.filter((item) => item !== 'update');
    await visit(urls.account);

    assert.dom(commonSelectors.EDIT_BTN).doesNotExist();
  });

  test('can update an account and cancel changes', async function (assert) {
    await visit(urls.account);

    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'updated name');
    await click('form button:not([type="submit"])');

    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, 'updated name');
    await click(commonSelectors.CANCEL_BTN);

    assert.notEqual(
      this.server.schema.accounts.all().models[0].name,
      'updated name',
    );
  });

  test('errors are displayed when save on account fails', async function (assert) {
    this.server.patch('/accounts/:id', () => {
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

    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, 'updated name');
    await click(commonSelectors.SAVE_BTN);

    await a11yAudit();
    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText('Oops.');
  });

  test('saving an existing account with invalid fields displays error messages', async function (assert) {
    this.server.patch('/accounts/:id', () => {
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
    await visit(urls.account);

    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, 'existing account');
    await click(commonSelectors.SAVE_BTN);

    await a11yAudit();
    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
    assert.dom(commonSelectors.FIELD_NAME_ERROR).hasText('Name is required.');
  });
});
