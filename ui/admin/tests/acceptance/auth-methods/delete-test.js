/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { TYPE_AUTH_METHOD_LDAP } from 'api/models/auth-method';

module('Acceptance | auth-methods | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let featuresService;
  let getAuthMethodCount;

  const DIALOG_DELETE_BTN_SELECTOR = '.rose-dialog .rose-button-primary';
  const DIALOG_CANCEL_BTN_SELECTOR = '.rose-dialog .rose-button-secondary';
  const ERROR_MSG_SELECTOR =
    '[data-test-toast-notification] .hds-alert__description';

  const MANAGE_DROPDOWN_SELECTOR =
    '[data-test-manage-auth-method] button:first-child';
  const DELETE_ACTION_SELECTOR =
    '[data-test-manage-auth-method] ul li:last-child button';

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    authMethod: null,
    ldapAuthMethod: null,
  };
  const urls = {
    orgScope: null,
    authMethods: null,
    authMethod: null,
    ldapAuthMethod: null,
  };

  hooks.beforeEach(function () {
    // Setup Mirage mock resources for this test
    authenticateSession({ username: 'admin' });
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.authMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
    });
    instances.ldapAuthMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
      type: TYPE_AUTH_METHOD_LDAP,
    });

    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.authMethods = `${urls.orgScope}/auth-methods`;
    urls.authMethod = `${urls.authMethods}/${instances.authMethod.id}`;
    urls.ldapAuthMethod = `${urls.authMethods}/${instances.ldapAuthMethod.id}`;
    featuresService = this.owner.lookup('service:features');
    getAuthMethodCount = () =>
      this.server.schema.authMethods.all().models.length;
  });

  test('can delete an auth method', async function (assert) {
    const authMethodsCount = getAuthMethodCount();
    await visit(urls.authMethods);

    await click(`[href="${urls.authMethod}"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);

    assert.strictEqual(getAuthMethodCount(), authMethodsCount - 1);
  });

  test('can delete an ldap auth method', async function (assert) {
    featuresService.enable('ldap-auth-methods');
    const authMethodsCount = getAuthMethodCount();
    await visit(urls.authMethods);

    await click(`[href="${urls.ldapAuthMethod}"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);

    assert.strictEqual(getAuthMethodCount(), authMethodsCount - 1);
  });

  test('errors are displayed when delete on an auth method fails', async function (assert) {
    this.server.del('/auth-methods/:id', () => {
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
    await visit(urls.authMethods);

    await click(`[href="${urls.authMethod}"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);
    await a11yAudit();

    assert.dom(ERROR_MSG_SELECTOR).hasText('Oops.');
  });

  test('errors are displayed when delete on an ldap auth method fails', async function (assert) {
    featuresService.enable('ldap-auth-methods');
    this.server.del('/auth-methods/:id', () => {
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
    await visit(urls.authMethods);

    await click(`[href="${urls.ldapAuthMethod}"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);
    await a11yAudit();

    assert.dom(ERROR_MSG_SELECTOR).hasText('Oops.');
  });

  test('cannot delete an auth method without proper authorization', async function (assert) {
    instances.authMethod.authorized_actions =
      instances.authMethod.authorized_actions.filter(
        (item) => item !== 'delete',
      );
    await visit(urls.authMethods);

    await click(`[href="${urls.authMethod}"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);

    assert.dom(DELETE_ACTION_SELECTOR).doesNotExist();
  });

  test('cannot delete an ldap auth method without proper authorization', async function (assert) {
    featuresService.enable('ldap-auth-methods');
    instances.ldapAuthMethod.authorized_actions =
      instances.ldapAuthMethod.authorized_actions.filter(
        (item) => item !== 'delete',
      );
    await visit(urls.authMethods);

    await click(`[href="${urls.ldapAuthMethod}"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);

    assert.dom(DELETE_ACTION_SELECTOR).doesNotExist();
  });

  test('user can accept delete auth method via dialog', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    const authMethodCount = getAuthMethodCount();
    await visit(urls.authMethods);

    await click(`[href="${urls.authMethod}"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);
    await click(DIALOG_DELETE_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.authMethods);
    assert.strictEqual(getAuthMethodCount(), authMethodCount - 1);
  });

  test('user can accept delete ldap auth method via dialog', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    featuresService.enable('ldap-auth-methods');
    const authMethodCount = getAuthMethodCount();
    await visit(urls.authMethods);

    await click(`[href="${urls.ldapAuthMethod}"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);
    await click(DIALOG_DELETE_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.authMethods);
    assert.strictEqual(getAuthMethodCount(), authMethodCount - 1);
  });

  test('user can cancel delete auth method via dialog', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    const authMethodCount = getAuthMethodCount();
    await visit(urls.authMethods);

    await click(`[href="${urls.authMethod}"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);
    await click(DIALOG_CANCEL_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.authMethod);
    assert.strictEqual(getAuthMethodCount(), authMethodCount);
  });

  test('user can cancel delete ldap auth method via dialog', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    featuresService.enable('ldap-auth-methods');
    const authMethodCount = getAuthMethodCount();
    await visit(urls.authMethods);

    await click(`[href="${urls.ldapAuthMethod}"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);
    await click(DIALOG_CANCEL_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.ldapAuthMethod);
    assert.strictEqual(getAuthMethodCount(), authMethodCount);
  });
});
