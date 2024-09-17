/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  currentSession,
  authenticateSession,
} from 'ember-simple-auth/test-support';
import { Response } from 'miragejs';
import {
  TYPE_AUTH_METHOD_LDAP,
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_PASSWORD,
} from 'api/models/auth-method';

module('Acceptance | auth-methods | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  const AUTH_LINK_SELECTOR = (id) =>
    `tbody [data-test-auth-methods-table-row="${id}"] a`;
  const AUTH_TYPE_SELECTOR = (id) =>
    `tbody [data-test-auth-methods-table-row="${id}"] .hds-table__td:nth-child(2)`;
  const AUTH_ACTIONS_SELECTOR = (id) =>
    `tbody [data-test-auth-methods-table-row="${id}"] .hds-table__td:last-child .hds-dropdown`;

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    passwordAuthMethodOrg: null,
    oidcAuthMethodGlobal: null,
    ldapAuthMethod: null,
  };

  const urls = {
    globalScope: null,
    orgScope: null,
    orgAuthMethods: null,
    globalAuthMethods: null,
    passwordAuthMethodOrg: null,
    oidcAuthMethodGlobal: null,
  };

  hooks.beforeEach(function () {
    // Setup Mirage mock resources for this test
    authenticateSession({ username: 'admin' });
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.passwordAuthMethodOrg = this.server.create('auth-method', {
      scope: instances.scopes.org,
      type: TYPE_AUTH_METHOD_PASSWORD,
    });
    instances.oidcAuthMethodGlobal = this.server.create('auth-method', {
      scope: instances.scopes.global,
      type: TYPE_AUTH_METHOD_OIDC,
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.orgAuthMethods = `${urls.orgScope}/auth-methods`;
    urls.globalAuthMethods = `${urls.globalScope}/auth-methods`;
    urls.passwordAuthMethodOrg = `${urls.orgAuthMethods}/${instances.passwordAuthMethodOrg.id}`;
    urls.oidcAuthMethodGlobal = `${urls.globalAuthMethods}/${instances.oidcAuthMethodGlobal.id}`;
  });

  module('a11yAudit', function () {
    test.each('auth-methods', ['light', 'dark'], async function (assert, data) {
      assert.expect(0);
      currentSession().set('data.theme', data);
      await visit(urls.orgAuthMethods);
      // open new dropdown
      await click('.rose-layout-page-actions button');
      await a11yAudit();
      // open dropdown at last row
      await click('td:last-child button');
      await a11yAudit();
      // open primary filter
      await click('.hds-segmented-group div[name="primary"] div button');
      await a11yAudit();
      // check 'yes'
      await click(
        '.hds-segmented-group div[name="primary"] div:last-child input',
      );
      await a11yAudit();
    });

    test('API error', async function (assert) {
      assert.expect(0);
      this.server.get('/auth-methods', () => {
        return new Response(
          418,
          {},
          {
            status: 418,
            code: "I'm a teapot",
            message: 'Ope, sorry about that!',
          },
        );
      });

      await visit(urls.globalAuthMethods);
      await a11yAudit();

      currentSession().set('data.theme', 'dark');
      await a11yAudit();
    });
  });

  test('visiting auth methods in org scope', async function (assert) {
    await visit(urls.orgScope);

    await click(`[href="${urls.orgAuthMethods}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.orgAuthMethods);
  });

  test('visiting auth methods in global scope', async function (assert) {
    await visit(urls.globalScope);

    await click(`[href="${urls.globalAuthMethods}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.globalAuthMethods);
  });

  test('can navigate to an auth method form in org scope', async function (assert) {
    await visit(urls.orgScope);

    await click(`[href="${urls.orgAuthMethods}"]`);

    assert
      .dom(AUTH_TYPE_SELECTOR(instances.passwordAuthMethodOrg.id))
      .hasText('Password');
    assert
      .dom(AUTH_ACTIONS_SELECTOR(instances.passwordAuthMethodOrg.id))
      .exists();

    await click(AUTH_LINK_SELECTOR(instances.passwordAuthMethodOrg.id));
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.passwordAuthMethodOrg);
  });

  test('can navigate to an auth method form in global scope', async function (assert) {
    await visit(urls.globalScope);

    await click(`[href="${urls.globalAuthMethods}"]`);

    assert
      .dom(AUTH_TYPE_SELECTOR(instances.oidcAuthMethodGlobal.id))
      .hasText('OIDC');
    assert
      .dom(AUTH_ACTIONS_SELECTOR(instances.oidcAuthMethodGlobal.id))
      .exists();

    await click(AUTH_LINK_SELECTOR(instances.oidcAuthMethodGlobal.id));
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.oidcAuthMethodGlobal);
  });

  test('cannot navigate to an auth method form without proper authorization in org scope', async function (assert) {
    instances.passwordAuthMethodOrg.authorized_actions =
      instances.passwordAuthMethodOrg.authorized_actions.filter(
        (item) => item !== 'read',
      );
    await visit(urls.orgScope);

    await click(`[href="${urls.orgAuthMethods}"]`);

    assert
      .dom(AUTH_LINK_SELECTOR(instances.passwordAuthMethodOrg.id))
      .doesNotExist();
  });

  test('cannot navigate to an auth method form without proper authorization in global scope', async function (assert) {
    instances.oidcAuthMethodGlobal.authorized_actions =
      instances.oidcAuthMethodGlobal.authorized_actions.filter(
        (item) => item !== 'read',
      );
    await visit(urls.globalScope);

    await click(`[href="${urls.globalAuthMethods}"]`);

    assert
      .dom(AUTH_LINK_SELECTOR(instances.oidcAuthMethodGlobal.id))
      .doesNotExist();
  });

  test('cannot navigate to an ldap auth method form in global scope', async function (assert) {
    instances.ldapAuthMethod = this.server.create('auth-method', {
      scope: instances.scopes.global,
      type: TYPE_AUTH_METHOD_LDAP,
    });
    await visit(urls.globalScope);

    await click(`[href="${urls.globalAuthMethods}"]`);

    assert.dom(AUTH_LINK_SELECTOR(instances.ldapAuthMethod.id)).doesNotExist();
    assert.dom(AUTH_TYPE_SELECTOR(instances.ldapAuthMethod.id)).hasText('LDAP');
    assert
      .dom(AUTH_ACTIONS_SELECTOR(instances.ldapAuthMethod.id))
      .doesNotExist();
  });

  test('cannot navigate to an ldap auth method form in org scope', async function (assert) {
    instances.ldapAuthMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
      type: TYPE_AUTH_METHOD_LDAP,
    });
    await visit(urls.orgScope);

    await click(`[href="${urls.orgAuthMethods}"]`);

    assert.dom(AUTH_LINK_SELECTOR(instances.ldapAuthMethod.id)).doesNotExist();
    assert.dom(AUTH_TYPE_SELECTOR(instances.ldapAuthMethod.id)).hasText('LDAP');
    assert
      .dom(AUTH_ACTIONS_SELECTOR(instances.ldapAuthMethod.id))
      .doesNotExist();
  });

  test('users can navigate to auth method and incorrect url autocorrects', async function (assert) {
    const orgScope = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    const authMethod = this.server.create('auth-method', {
      scope: orgScope,
    });
    const incorrectUrl = `${urls.globalAuthMethods}/${authMethod.id}/accounts`;
    const correctUrl = `/scopes/${orgScope.id}/auth-methods/${authMethod.id}/accounts`;

    await visit(incorrectUrl);

    assert.notEqual(currentURL(), incorrectUrl);
    assert.strictEqual(currentURL(), correctUrl);
  });
});
