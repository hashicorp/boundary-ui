/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import {
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
} from 'api/models/auth-method';

module('Acceptance | managed-groups | create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let getManagedGroupCount;
  let featuresService;

  const SAVE_BTN_SELECTOR = '.rose-form-actions [type="submit"]';
  const CANCEL_BTN_SELECTOR = '.rose-form-actions [type="button"]';
  const NAME_INPUT_SELECTOR = '[name="name"]';
  const DESC_INPUT_SELECTOR = '[name="description"]';
  const ERROR_MSG_SELECTOR = '.rose-notification-body';
  const FIELD_ERROR_TEXT_SELECTOR = '.hds-form-error__message';

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

    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.authMethods = `${urls.orgScope}/auth-methods`;
    urls.authMethod = `${urls.authMethods}/${instances.authMethod.id}`;
    urls.ldapAuthMethod = `${urls.authMethods}/${instances.ldapAuthMethod.id}`;
    urls.managedGroups = `${urls.authMethod}/managed-groups`;
    urls.ldapManagedGroups = `${urls.ldapAuthMethod}/managed-groups`;
    urls.newManagedGroup = `${urls.managedGroups}/new`;
    urls.newLdapManagedGroup = `${urls.ldapManagedGroups}/new`;

    getManagedGroupCount = () =>
      this.server.schema.managedGroups.all().models.length;
    featuresService = this.owner.lookup('service:features');
  });

  test('can create a new managed group', async function (assert) {
    assert.expect(3);
    const managedGroupsCount = getManagedGroupCount();
    const name = 'Managed group name';
    await visit(urls.authMethod);

    await click(`[href="${urls.newManagedGroup}"]`);
    await fillIn(NAME_INPUT_SELECTOR, name);
    await fillIn(DESC_INPUT_SELECTOR, 'description');
    await click(SAVE_BTN_SELECTOR);

    const managedGroup = this.server.schema.managedGroups.findBy({ name });
    assert.strictEqual(managedGroup.name, name);
    assert.strictEqual(managedGroup.description, 'description');
    assert.strictEqual(getManagedGroupCount(), managedGroupsCount + 1);
  });

  test('can create a new ldap managed group', async function (assert) {
    assert.expect(4);
    const managedGroupsCount = getManagedGroupCount();
    const name = 'Managed group name';
    await visit(urls.ldapAuthMethod);

    await click(`[href="${urls.newLdapManagedGroup}"]`);
    await fillIn(NAME_INPUT_SELECTOR, name);
    await fillIn(DESC_INPUT_SELECTOR, 'description');
    await fillIn('[name="group_names"] input', 'group name');
    await click('[name="group_names"] button');
    await click(SAVE_BTN_SELECTOR);

    const managedGroup = this.server.schema.managedGroups.findBy({ name });
    assert.strictEqual(managedGroup.name, name);
    assert.strictEqual(managedGroup.description, 'description');
    assert.deepEqual(managedGroup.attributes.group_names, ['group name']);
    assert.strictEqual(getManagedGroupCount(), managedGroupsCount + 1);
  });

  test('User cannot create a new managed group without proper authorization', async function (assert) {
    assert.expect(2);
    instances.authMethod.authorized_collection_actions['managed-groups'] =
      instances.authMethod.authorized_collection_actions[
        'managed-groups'
      ].filter((item) => item !== 'create');
    await visit(urls.authMethods);

    await click(`[href="${urls.authMethod}"]`);

    assert.false(
      instances.authMethod.authorized_collection_actions[
        'managed-groups'
      ].includes('create')
    );
    assert.dom(`[href="${urls.newManagedGroup}"]`).doesNotExist();
  });

  test('User cannot create a new ldap managed group without proper authorization', async function (assert) {
    assert.expect(2);
    featuresService.enable('ldap-auth-methods');
    instances.ldapAuthMethod.authorized_collection_actions['managed-groups'] =
      instances.ldapAuthMethod.authorized_collection_actions[
        'managed-groups'
      ].filter((item) => item !== 'create');
    await visit(urls.authMethods);

    await click(`[href="${urls.ldapAuthMethod}"]`);

    assert.false(
      instances.ldapAuthMethod.authorized_collection_actions[
        'managed-groups'
      ].includes('create')
    );
    assert.dom(`[href="${urls.newLdapManagedGroup}"]`).doesNotExist();
  });

  test('User can cancel a new managed group creation', async function (assert) {
    assert.expect(2);
    const managedGroupsCount = getManagedGroupCount();
    await visit(urls.authMethod);

    await click(`[href="${urls.newManagedGroup}"]`);
    await fillIn(NAME_INPUT_SELECTOR, 'Managed group name');
    await click(CANCEL_BTN_SELECTOR);

    assert.strictEqual(getManagedGroupCount(), managedGroupsCount);
    assert.strictEqual(currentURL(), urls.managedGroups);
  });

  test('User can cancel a new ldap managed group creation', async function (assert) {
    assert.expect(2);
    const managedGroupsCount = getManagedGroupCount();
    await visit(urls.ldapAuthMethod);

    await click(`[href="${urls.newLdapManagedGroup}"]`);
    await fillIn(NAME_INPUT_SELECTOR, 'Managed group name');
    await click(CANCEL_BTN_SELECTOR);

    assert.strictEqual(getManagedGroupCount(), managedGroupsCount);
    assert.strictEqual(currentURL(), urls.ldapManagedGroups);
  });

  test('When user saving a new managed group with invalid fields displays error message', async function (assert) {
    assert.expect(2);
    this.server.post('/managed-groups', () => {
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
        }
      );
    });
    await visit(urls.authMethod);

    await click(`[href="${urls.newManagedGroup}"]`);
    await fillIn(NAME_INPUT_SELECTOR, 'new managed group');
    await click(SAVE_BTN_SELECTOR);
    await a11yAudit();

    assert.dom(ERROR_MSG_SELECTOR).hasText('The request was invalid.');
    assert.dom('.rose-form-error-message').hasText('Name is required.');
  });

  test('When user saving a new ldap managed group with invalid fields displays error message', async function (assert) {
    assert.expect(2);
    this.server.post('/managed-groups', () => {
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
        }
      );
    });
    await visit(urls.ldapAuthMethod);

    await click(`[href="${urls.newLdapManagedGroup}"]`);
    await fillIn(NAME_INPUT_SELECTOR, 'new managed group');
    await click(SAVE_BTN_SELECTOR);
    await a11yAudit();

    assert.dom(ERROR_MSG_SELECTOR).hasText('The request was invalid.');
    assert.dom(FIELD_ERROR_TEXT_SELECTOR).hasText('Name is required.');
  });
});
