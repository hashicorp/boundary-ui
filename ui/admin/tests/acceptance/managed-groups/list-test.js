/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import {
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
} from 'api/models/auth-method';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | managed-groups | list', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

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
    authMethods: null,
    authMethod: null,
    ldapAuthMethod: null,
    managedGroups: null,
    ldapManagedGroups: null,
    newManagedGroup: null,
    newLdapManagedGroup: null,
  };

  hooks.beforeEach(async function () {
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
    urls.authMethods = `/scopes/${instances.scopes.org.id}/auth-methods`;
    urls.authMethod = `${urls.authMethods}/${instances.authMethod.id}`;
    urls.ldapAuthMethod = `${urls.authMethods}/${instances.ldapAuthMethod.id}`;
    urls.managedGroups = `${urls.authMethod}/managed-groups`;
    urls.ldapManagedGroups = `${urls.ldapAuthMethod}/managed-groups`;
    urls.newManagedGroup = `${urls.managedGroups}/new`;
    urls.newLdapManagedGroup = `${urls.ldapManagedGroups}/new`;
    featuresService = this.owner.lookup('service:features');
  });

  test('User can navigate to managed groups with proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.authMethods);

    await click(commonSelectors.HREF(urls.authMethod));

    assert.true(
      instances.authMethod.authorized_collection_actions[
        'managed-groups'
      ].includes('list'),
    );
    assert.true(
      instances.authMethod.authorized_collection_actions[
        'managed-groups'
      ].includes('create'),
    );
    assert.dom(commonSelectors.HREF(urls.managedGroups)).exists();
  });

  test('User can navigate to ldap managed groups with proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('ldap-auth-methods');
    await visit(urls.authMethods);

    await click(commonSelectors.HREF(urls.ldapAuthMethod));

    assert.true(
      instances.ldapAuthMethod.authorized_collection_actions[
        'managed-groups'
      ].includes('list'),
    );
    assert.true(
      instances.ldapAuthMethod.authorized_collection_actions[
        'managed-groups'
      ].includes('create'),
    );
    assert.dom(commonSelectors.HREF(urls.ldapManagedGroups)).exists();
  });

  test('User cannot navigate to index without either list or create actions', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.authMethod.authorized_collection_actions['managed-groups'] = [];
    await visit(urls.authMethods);

    await click(commonSelectors.HREF(urls.authMethod));

    assert.false(
      instances.authMethod.authorized_collection_actions[
        'managed-groups'
      ].includes('list'),
    );
    assert.false(
      instances.authMethod.authorized_collection_actions[
        'managed-groups'
      ].includes('create'),
    );
    assert.dom(commonSelectors.HREF(urls.managedGroups)).doesNotExist();
  });

  test('User cannot navigate to ldap managed group index without either list or create actions', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('ldap-auth-methods');
    instances.ldapAuthMethod.authorized_collection_actions['managed-groups'] =
      [];
    await visit(urls.authMethods);

    await click(commonSelectors.HREF(urls.ldapAuthMethod));

    assert.false(
      instances.ldapAuthMethod.authorized_collection_actions[
        'managed-groups'
      ].includes('list'),
    );
    assert.false(
      instances.ldapAuthMethod.authorized_collection_actions[
        'managed-groups'
      ].includes('create'),
    );
    assert.dom(commonSelectors.HREF(urls.ldapManagedGroups)).doesNotExist();
  });

  test('User can navigate to index with only create action', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.authMethod.authorized_collection_actions['managed-groups'] = [
      'create',
    ];
    await visit(urls.authMethods);

    await click(commonSelectors.HREF(urls.authMethod));
    await click(selectors.MANAGE_DROPDOWN_AUTH_METHOD);

    assert.dom(commonSelectors.HREF(urls.managedGroups)).exists();
    assert.dom(commonSelectors.HREF(urls.newManagedGroup)).exists();
  });

  test('User can navigate to ldap managed groups index with only create action', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('ldap-auth-methods');
    instances.authMethod.authorized_collection_actions['managed-groups'] = [
      'create',
    ];
    await visit(urls.authMethods);

    await click(commonSelectors.HREF(urls.ldapAuthMethod));
    await click(selectors.MANAGE_DROPDOWN_AUTH_METHOD);

    assert.dom(commonSelectors.HREF(urls.ldapManagedGroups)).exists();
    assert.dom(commonSelectors.HREF(urls.newLdapManagedGroup)).exists();
  });
});
