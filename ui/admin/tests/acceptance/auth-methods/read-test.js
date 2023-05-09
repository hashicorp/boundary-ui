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
import { TYPE_AUTH_METHOD_LDAP } from 'api/models/auth-method';

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
    authMethod: null,
    ldapAuthMethod: null,
  };

  const urls = {
    orgScope: null,
    authMethods: null,
    newAuthMethod: null,
    authMethod: null,
  };

  hooks.beforeEach(function () {
    // Setup Mirage mock resources for this test
    authenticateSession({});
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.authMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
    });
    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.authMethods = `${urls.orgScope}/auth-methods`;
    urls.newAuthMethod = `${urls.authMethods}/new?type=password`;
    urls.authMethod = `${urls.authMethods}/${instances.authMethod.id}`;
  });

  test('visiting auth methods', async function (assert) {
    assert.expect(1);
    await visit(urls.orgScope);

    await click(`[href="${urls.authMethods}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.authMethods);
  });

  test('can navigate to an auth method form', async function (assert) {
    assert.expect(3);
    await visit(urls.orgScope);

    await click(`[href="${urls.authMethods}"]`);

    assert.dom(AUTH_TYPE_SELECTOR).hasText('Password');
    assert.dom(AUTH_ACTIONS_SELECTOR).exists();

    await click(AUTH_LINK_SELECTOR);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.authMethod);
  });

  test('cannot navigate to an auth method form without proper authorization', async function (assert) {
    assert.expect(1);
    instances.authMethod.authorized_actions =
      instances.authMethod.authorized_actions.filter((item) => item !== 'read');
    await visit(urls.orgScope);

    await click(`[href="${urls.authMethods}"]`);

    assert.dom(AUTH_LINK_SELECTOR).doesNotExist();
  });

  test('cannot navigate to an ldap auth method form', async function (assert) {
    assert.expect(3);
    instances.ldapAuthMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
      type: TYPE_AUTH_METHOD_LDAP,
    });
    await visit(urls.orgScope);

    await click(`[href="${urls.authMethods}"]`);

    assert.dom(LDAP_AUTH_LINK_SELECTOR).doesNotExist();
    assert.dom(LDAP_AUTH_TYPE_SELECTOR).hasText('LDAP');
    assert.dom(LDAP_AUTH_ACTIONS_SELECTOR).doesNotExist();
  });
});
