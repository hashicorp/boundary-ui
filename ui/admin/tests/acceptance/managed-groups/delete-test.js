/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import {
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
} from 'api/models/auth-method';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | managed-groups | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let getManagedGroupCount;

  const MANAGE_DROPDOWN_SELECTOR =
    '[data-test-managed-group-dropdown] button:first-child';
  const DELETE_ACTION_SELECTOR =
    '[data-test-managed-group-dropdown] ul li button';

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

  hooks.beforeEach(async function () {
    await authenticateSession({ username: 'admin' });
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

    getManagedGroupCount = () =>
      this.server.schema.managedGroups.all().models.length;
  });

  test('User can delete a managed group', async function (assert) {
    const managedGroupsCount = getManagedGroupCount();
    await visit(urls.managedGroups);

    await click(`[href="${urls.managedGroup}"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);

    assert.strictEqual(getManagedGroupCount(), managedGroupsCount - 1);
    assert.strictEqual(currentURL(), urls.managedGroups);
  });

  test('User can delete a ldap managed group', async function (assert) {
    const managedGroupsCount = getManagedGroupCount();
    await visit(urls.ldapManagedGroups);

    await click(`[href="${urls.ldapManagedGroup}"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);

    assert.strictEqual(getManagedGroupCount(), managedGroupsCount - 1);
    assert.strictEqual(currentURL(), urls.ldapManagedGroups);
  });

  test('User cannot delete a managed-group without proper authorization', async function (assert) {
    instances.managedGroup.authorized_actions =
      instances.managedGroup.authorized_actions.filter(
        (item) => item !== 'delete',
      );
    await visit(urls.managedGroups);

    await click(`[href="${urls.managedGroup}"]`);

    assert.dom(MANAGE_DROPDOWN_SELECTOR).doesNotExist();
  });

  test('User cannot delete a ldap managed-group without proper authorization', async function (assert) {
    instances.ldapManagedGroup.authorized_actions =
      instances.ldapManagedGroup.authorized_actions.filter(
        (item) => item !== 'delete',
      );
    await visit(urls.ldapManagedGroups);

    await click(`[href="${urls.ldapManagedGroup}"]`);

    assert.dom(MANAGE_DROPDOWN_SELECTOR).doesNotExist();
  });

  test('Errors are displayed when delete on managed group fails', async function (assert) {
    this.server.del('/managed-groups/:id', () => {
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
    await visit(urls.managedGroups);

    await click(`[href="${urls.managedGroup}"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);
    await a11yAudit();

    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText('Oops.');
    assert.strictEqual(currentURL(), urls.managedGroup);
  });

  test('Errors are displayed when delete on ldap managed group fails', async function (assert) {
    this.server.del('/managed-groups/:id', () => {
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
    await visit(urls.ldapManagedGroups);

    await click(`[href="${urls.ldapManagedGroup}"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);
    await a11yAudit();

    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText('Oops.');
    assert.strictEqual(currentURL(), urls.ldapManagedGroup);
  });
});
