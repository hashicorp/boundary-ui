/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { Response } from 'miragejs';
import {
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
} from 'api/models/auth-method';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | managed-groups | create', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  let getManagedGroupCount;
  let featuresService;

  const instances = {
    scopes: {
      org: null,
    },
    authMethod: null,
    ldapAuthMethod: null,
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

    // Generate route URLs for resources
    urls.authMethods = `/scopes/${instances.scopes.org.id}/auth-methods`;
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
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const managedGroupsCount = getManagedGroupCount();
    await visit(urls.authMethod);
    await click(selectors.MANAGE_DROPDOWN_AUTH_METHOD);
    await click(commonSelectors.HREF(urls.newManagedGroup));

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await fillIn(
      commonSelectors.FIELD_DESCRIPTION,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );
    await click(commonSelectors.SAVE_BTN);

    const managedGroup = this.server.schema.managedGroups.findBy({
      name: commonSelectors.FIELD_NAME_VALUE,
    });
    assert.strictEqual(managedGroup.name, commonSelectors.FIELD_NAME_VALUE);
    assert.strictEqual(
      managedGroup.description,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );
    assert.strictEqual(getManagedGroupCount(), managedGroupsCount + 1);
  });

  test('can create a new ldap managed group', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const managedGroupsCount = getManagedGroupCount();
    await visit(urls.ldapAuthMethod);
    await click(selectors.MANAGE_DROPDOWN_AUTH_METHOD);

    await click(commonSelectors.HREF(urls.newLdapManagedGroup));
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await fillIn(
      commonSelectors.FIELD_DESCRIPTION,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );
    await fillIn(
      selectors.FIELD_GROUP_NAMES,
      selectors.FIELD_GROUP_NAMES_VALUE,
    );
    await click(selectors.FIELD_GROUP_NAMES_BTN);
    await click(commonSelectors.SAVE_BTN);

    const managedGroup = this.server.schema.managedGroups.findBy({
      name: commonSelectors.FIELD_NAME_VALUE,
    });
    assert.strictEqual(managedGroup.name, commonSelectors.FIELD_NAME_VALUE);
    assert.strictEqual(
      managedGroup.description,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );
    assert.deepEqual(managedGroup.attributes.group_names, [
      selectors.FIELD_GROUP_NAMES_VALUE,
    ]);
    assert.strictEqual(getManagedGroupCount(), managedGroupsCount + 1);
  });

  test('User cannot create a new managed group without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.authMethod.authorized_collection_actions['managed-groups'] =
      instances.authMethod.authorized_collection_actions[
        'managed-groups'
      ].filter((item) => item !== 'create');
    await visit(urls.authMethods);

    await click(commonSelectors.HREF(urls.authMethod));

    assert.false(
      instances.authMethod.authorized_collection_actions[
        'managed-groups'
      ].includes('create'),
    );
    assert.dom(commonSelectors.HREF(urls.newManagedGroup)).doesNotExist();
  });

  test('User cannot create a new ldap managed group without proper authorization', async function (assert) {
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
      instances.ldapAuthMethod.authorized_collection_actions[
        'managed-groups'
      ].filter((item) => item !== 'create');
    await visit(urls.authMethods);

    await click(commonSelectors.HREF(urls.ldapAuthMethod));

    assert.false(
      instances.ldapAuthMethod.authorized_collection_actions[
        'managed-groups'
      ].includes('create'),
    );
    assert.dom(commonSelectors.HREF(urls.newLdapManagedGroup)).doesNotExist();
  });

  test('User can cancel a new managed group creation', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const managedGroupsCount = getManagedGroupCount();
    await visit(urls.authMethod);
    await click(selectors.MANAGE_DROPDOWN_AUTH_METHOD);

    await click(commonSelectors.HREF(urls.newManagedGroup));
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(getManagedGroupCount(), managedGroupsCount);
    assert.strictEqual(currentURL(), urls.managedGroups);
  });

  test('User can cancel a new ldap managed group creation', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const managedGroupsCount = getManagedGroupCount();
    await visit(urls.ldapAuthMethod);
    await click(selectors.MANAGE_DROPDOWN_AUTH_METHOD);

    await click(commonSelectors.HREF(urls.newLdapManagedGroup));
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(getManagedGroupCount(), managedGroupsCount);
    assert.strictEqual(currentURL(), urls.ldapManagedGroups);
  });

  test('When user saving a new managed group with invalid fields displays error message', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

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
                name: 'attributes.filter',
                description: 'This field is required.',
              },
            ],
          },
        },
      );
    });
    await visit(urls.authMethod);
    await click(selectors.MANAGE_DROPDOWN_AUTH_METHOD);

    await click(commonSelectors.HREF(urls.newManagedGroup));
    await click(commonSelectors.SAVE_BTN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
    assert.dom(selectors.FIELD_FILTER_ERROR).hasText('This field is required.');
  });

  test('When user saving a new ldap managed group with invalid fields displays error message', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

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
                name: 'attributes.group_names',
                description: 'This field is required.',
              },
            ],
          },
        },
      );
    });
    await visit(urls.ldapAuthMethod);
    await click(selectors.MANAGE_DROPDOWN_AUTH_METHOD);

    await click(commonSelectors.HREF(urls.newLdapManagedGroup));
    await click(commonSelectors.SAVE_BTN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
    assert
      .dom(selectors.FIELD_GROUP_NAMES_ERROR)
      .hasText('This field is required.');
  });

  test('Users cannot directly navigate to a new managed group route without proper authorization', async function (assert) {
    instances.authMethod.authorized_collection_actions['managed-groups'] =
      instances.authMethod.authorized_collection_actions[
        'managed-groups'
      ].filter((item) => item !== 'create');

    await visit(urls.newManagedGroup);

    assert.false(
      instances.authMethod.authorized_collection_actions[
        'managed-groups'
      ].includes('create'),
    );
    assert.strictEqual(currentURL(), urls.managedGroups);
  });
});
