/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, find, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | accounts | update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    authMethods: null,
    account: null,
  };
  const urls = {
    orgScope: null,
    authMethods: null,
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

  test('can update resource and save changes', async function (assert) {
    await visit(urls.account);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'update name');
    await click('form [type="submit"]:not(:disabled)');
    assert.strictEqual(this.server.db.accounts[0].name, 'update name');
  });

  test('can update resource and save LDAP account changes', async function (assert) {
    await visit(urls.account);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'updated name');
    await fillIn('[name="description"]', 'updated desc');
    await click('form [type="submit"]:not(:disabled)');
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
    assert.notOk(find('form [type="button"]'));
  });

  test('can update an account and cancel changes', async function (assert) {
    await visit(urls.account);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'update name');
    await click('form button:not([type="submit"])');
    assert.notEqual(this.server.db.accounts[0].name, 'update name');
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
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'save account');
    await click('form [type="submit"]');
    await a11yAudit();
    assert.strictEqual(
      find('.rose-notification-body').textContent.trim(),
      'Oops.',
      'Displays primary error message.',
    );
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
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'existing account');
    await click('form [type="submit"]');
    await a11yAudit();
    assert.strictEqual(
      find('.rose-notification-body').textContent.trim(),
      'The request was invalid.',
      'Displays primary error message.',
    );
    assert.strictEqual(
      find('[data-test-error-message-name]').textContent.trim(),
      'Name is required.',
      'Displays field-level errors.',
    );
  });
});
