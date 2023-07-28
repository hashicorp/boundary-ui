/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import {
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
} from 'api/models/auth-method';

module('Acceptance | managed-groups | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let featuresService;

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    authMethod: null,
    ldapAuthMethod: null,
    managedGroup: null,
  };
  const urls = {
    orgScope: null,
    authMethods: null,
    authMethod: null,
    ldapAuthMethod: null,
    managedGroups: null,
    ldapManagedGroups: null,
    newManagedGroup: null,
    newLdapManagedGroup: null,
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

    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.authMethods = `${urls.orgScope}/auth-methods`;
    urls.authMethod = `${urls.authMethods}/${instances.authMethod.id}`;
    urls.ldapAuthMethod = `${urls.authMethods}/${instances.ldapAuthMethod.id}`;
    urls.managedGroups = `${urls.authMethod}/managed-groups`;
    urls.ldapManagedGroups = `${urls.ldapAuthMethod}/managed-groups`;
    urls.newManagedGroup = `${urls.managedGroups}/new`;
    urls.newLdapManagedGroup = `${urls.ldapManagedGroups}/new`;
    featuresService = this.owner.lookup('service:features');
  });

  test('User can navigate to managed groups with proper authorization', async function (assert) {
    assert.expect(3);
    await visit(urls.authMethods);

    await click(`[href="${urls.authMethod}"]`);

    assert.true(
      instances.authMethod.authorized_collection_actions[
        'managed-groups'
      ].includes('list')
    );
    assert.true(
      instances.authMethod.authorized_collection_actions[
        'managed-groups'
      ].includes('create')
    );
    assert.dom(`[href="${urls.managedGroups}"]`).exists();
  });

  test('User can navigate to ldap managed groups with proper authorization', async function (assert) {
    assert.expect(3);
    featuresService.enable('ldap-auth-methods');
    await visit(urls.authMethods);

    await click(`[href="${urls.ldapAuthMethod}"]`);

    assert.true(
      instances.ldapAuthMethod.authorized_collection_actions[
        'managed-groups'
      ].includes('list')
    );
    assert.true(
      instances.ldapAuthMethod.authorized_collection_actions[
        'managed-groups'
      ].includes('create')
    );
    assert.dom(`[href="${urls.ldapManagedGroups}"]`).exists();
  });

  test('User cannot navigate to index without either list or create actions', async function (assert) {
    assert.expect(3);
    instances.authMethod.authorized_collection_actions['managed-groups'] = [];
    await visit(urls.authMethods);

    await click(`[href="${urls.authMethod}"]`);

    assert.false(
      instances.authMethod.authorized_collection_actions[
        'managed-groups'
      ].includes('list')
    );
    assert.false(
      instances.authMethod.authorized_collection_actions[
        'managed-groups'
      ].includes('create')
    );
    assert.dom(`[href="${urls.managedGroups}"]`).doesNotExist();
  });

  test('User cannot navigate to ldap managed group index without either list or create actions', async function (assert) {
    assert.expect(3);
    featuresService.enable('ldap-auth-methods');
    instances.ldapAuthMethod.authorized_collection_actions['managed-groups'] =
      [];
    await visit(urls.authMethods);

    await click(`[href="${urls.ldapAuthMethod}"]`);

    assert.false(
      instances.ldapAuthMethod.authorized_collection_actions[
        'managed-groups'
      ].includes('list')
    );
    assert.false(
      instances.ldapAuthMethod.authorized_collection_actions[
        'managed-groups'
      ].includes('create')
    );
    assert.dom(`[href="${urls.ldapManagedGroups}"]`).doesNotExist();
  });

  test('User can navigate to index with only create action', async function (assert) {
    assert.expect(2);
    instances.authMethod.authorized_collection_actions['managed-groups'] = [
      'create',
    ];
    await visit(urls.authMethods);

    await click(`[href="${urls.authMethod}"]`);

    assert.dom(`[href="${urls.managedGroups}"]`).exists();
    assert.dom(`[href="${urls.newManagedGroup}"]`).exists();
  });

  test('User can navigate to ldap managed groups index with only create action', async function (assert) {
    assert.expect(2);
    featuresService.enable('ldap-auth-methods');
    instances.authMethod.authorized_collection_actions['managed-groups'] = [
      'create',
    ];
    await visit(urls.authMethods);

    await click(`[href="${urls.ldapAuthMethod}"]`);

    assert.dom(`[href="${urls.ldapManagedGroups}"]`).exists();
    assert.dom(`[href="${urls.newLdapManagedGroup}"]`).exists();
  });
});
