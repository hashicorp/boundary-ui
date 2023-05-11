/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  authenticateSession,
  //   // These are left here intentionally for future reference.
  //   //currentSession,
  //   //invalidateSession,
} from 'ember-simple-auth/test-support';
import {
  TYPE_AUTH_METHOD_LDAP,
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_PASSWORD,
} from 'api/models/auth-method';

module('Acceptance | auth methods | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  const AUTH_LINK_SELECTOR =
    'main tbody .rose-table-header-cell:nth-child(1) a';
  const AUTH_TYPE_SELECTOR =
    'tbody .rose-table-row:nth-child(1) .rose-table-cell';
  const AUTH_ACTIONS_SELECTOR =
    'tbody .rose-table-row:nth-child(1) .rose-table-cell:last-child .rose-dropdown';
  const LDAP_AUTH_LINK_SELECTOR = 'tbody .rose-table-row:nth-child(2) a';
  const LDAP_AUTH_TYPE_SELECTOR =
    'tbody .rose-table-row:nth-child(2) .rose-table-cell';
  const LDAP_AUTH_ACTIONS_SELECTOR =
    'tbody .rose-table-row:nth-child(2) .rose-table-cell:last-child .rose-dropdown';

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
    authenticateSession({});
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

  test('visiting auth methods in org scope', async function (assert) {
    assert.expect(1);
    await visit(urls.orgScope);

    await click(`[href="${urls.orgAuthMethods}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.orgAuthMethods);
  });

  test('visiting auth methods in global scope', async function (assert) {
    assert.expect(1);
    await visit(urls.globalScope);

    await click(`[href="${urls.globalAuthMethods}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.globalAuthMethods);
  });

  test('can navigate to an auth method form in org scope', async function (assert) {
    assert.expect(3);
    await visit(urls.orgScope);

    await click(`[href="${urls.orgAuthMethods}"]`);

    assert.dom(AUTH_TYPE_SELECTOR).hasText('Password');
    assert.dom(AUTH_ACTIONS_SELECTOR).exists();

    await click(AUTH_LINK_SELECTOR);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.passwordAuthMethodOrg);
  });

  test('can navigate to an auth method form in global scope', async function (assert) {
    assert.expect(3);
    await visit(urls.globalScope);

    await click(`[href="${urls.globalAuthMethods}"]`);

    assert.dom(AUTH_TYPE_SELECTOR).hasText('OIDC');
    assert.dom(AUTH_ACTIONS_SELECTOR).exists();

    await click(AUTH_LINK_SELECTOR);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.oidcAuthMethodGlobal);
  });

  test('cannot navigate to an auth method form without proper authorization in org scope', async function (assert) {
    assert.expect(1);
    instances.passwordAuthMethodOrg.authorized_actions =
      instances.passwordAuthMethodOrg.authorized_actions.filter(
        (item) => item !== 'read'
      );
    await visit(urls.orgScope);

    await click(`[href="${urls.orgAuthMethods}"]`);

    assert.dom(AUTH_LINK_SELECTOR).doesNotExist();
  });

  test('cannot navigate to an auth method form without proper authorization in global scope', async function (assert) {
    assert.expect(1);
    instances.oidcAuthMethodGlobal.authorized_actions =
      instances.oidcAuthMethodGlobal.authorized_actions.filter(
        (item) => item !== 'read'
      );
    await visit(urls.globalScope);

    await click(`[href="${urls.globalAuthMethods}"]`);

    assert.dom(AUTH_LINK_SELECTOR).doesNotExist();
  });

  test('cannot navigate to an ldap auth method form in global scope', async function (assert) {
    assert.expect(3);
    instances.ldapAuthMethod = this.server.create('auth-method', {
      scope: instances.scopes.global,
      type: TYPE_AUTH_METHOD_LDAP,
    });
    await visit(urls.globalScope);

    await click(`[href="${urls.globalAuthMethods}"]`);

    assert.dom(LDAP_AUTH_LINK_SELECTOR).doesNotExist();
    assert.dom(LDAP_AUTH_TYPE_SELECTOR).hasText('LDAP');
    assert.dom(LDAP_AUTH_ACTIONS_SELECTOR).doesNotExist();
  });

  test('cannot navigate to an ldap auth method form in org scope', async function (assert) {
    assert.expect(3);
    instances.ldapAuthMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
      type: TYPE_AUTH_METHOD_LDAP,
    });
    await visit(urls.orgScope);

    await click(`[href="${urls.orgAuthMethods}"]`);

    assert.dom(LDAP_AUTH_LINK_SELECTOR).doesNotExist();
    assert.dom(LDAP_AUTH_TYPE_SELECTOR).hasText('LDAP');
    assert.dom(LDAP_AUTH_ACTIONS_SELECTOR).doesNotExist();
  });
});
