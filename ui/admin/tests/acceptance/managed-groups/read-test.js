/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
} from 'api/models/auth-method';

module('Acceptance | managed-groups | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    authMethod: null,
    ldapAuthMethod: null,
    managedGroup: null,
    ldapManagedGroup: null,
  };
  const urls = {
    orgScope: null,
    authMethods: null,
    authMethod: null,
    ldapAuthMethod: null,
    managedGroups: null,
    ldapManagedGroups: null,
    managedGroup: null,
    ldapManagedGroup: null,
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
      type: TYPE_AUTH_METHOD_OIDC,
    });
    instances.ldapAuthMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
      type: TYPE_AUTH_METHOD_LDAP,
    });
    instances.managedGroup = this.server.create('managed-group', {
      scope: instances.scopes.org,
      authMethod: instances.authMethod,
    });
    instances.ldapManagedGroup = this.server.create('managed-group', {
      scope: instances.scopes.org,
      authMethod: instances.ldapAuthMethod,
    });
    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.authMethods = `${urls.orgScope}/auth-methods`;
    urls.authMethod = `${urls.authMethods}/${instances.authMethod.id}`;
    urls.ldapAuthMethod = `${urls.authMethods}/${instances.ldapAuthMethod.id}`;
    urls.managedGroups = `${urls.authMethod}/managed-groups`;
    urls.ldapManagedGroups = `${urls.ldapAuthMethod}/managed-groups`;
    urls.managedGroup = `${urls.managedGroups}/${instances.managedGroup.id}`;
    urls.ldapManagedGroup = `${urls.ldapManagedGroups}/${instances.ldapManagedGroup.id}`;
  });

  test('User can navigate to a managed group form', async function (assert) {
    assert.expect(1);
    await visit(urls.managedGroups);

    await click(`[href="${urls.managedGroup}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.managedGroup);
  });

  test('User can navigate to a ldap managed group form', async function (assert) {
    assert.expect(1);
    await visit(urls.ldapManagedGroups);

    await click(`[href="${urls.ldapManagedGroup}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.ldapManagedGroup);
  });

  test('User cannot navigate to a managed group form without proper authorization', async function (assert) {
    assert.expect(1);
    instances.managedGroup.authorized_actions =
      instances.managedGroup.authorized_actions.filter(
        (item) => item !== 'read'
      );
    await visit(urls.authMethod);

    await click(`[href="${urls.managedGroups}"]`);

    assert.dom(`[href="${urls.managedGroup}"]`).doesNotExist();
  });

  test('User cannot navigate to a ldap managed group form without proper authorization', async function (assert) {
    assert.expect(1);
    instances.ldapManagedGroup.authorized_actions =
      instances.ldapManagedGroup.authorized_actions.filter(
        (item) => item !== 'read'
      );
    await visit(urls.ldapAuthMethod);

    await click(`[href="${urls.ldapManagedGroups}"]`);

    assert.dom(`[href="${urls.ldapManagedGroup}"]`).doesNotExist();
  });
});
