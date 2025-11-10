/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, fillIn, currentURL, select } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { Response } from 'miragejs';
import {
  TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
  TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP,
} from 'api/models/credential-library';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';
import { TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN } from 'api/models/credential';

module('Acceptance | credential-libraries | create', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  let featuresService;
  let getCredentialLibraryCount;
  let getUsernamePasswordDomainCredentialLibraryCount;

  const instances = {
    scopes: {
      org: null,
      project: null,
    },
  };

  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    credentialStores: null,
    credentialStore: null,
    credentialLibrary: null,
    credentialLibraries: null,
    newCredentialLibrary: null,
  };

  hooks.beforeEach(async function () {
    // Generate resources
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.credentialStore = this.server.create('credential-store', {
      scope: instances.scopes.project,
    });
    instances.credentialLibrary = this.server.create('credential-library', {
      scope: instances.scopes.project,
      credentialStore: instances.credentialStore,
      http_method: 'GET',
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.credentialStores = `${urls.projectScope}/credential-stores`;
    urls.credentialStore = `${urls.credentialStores}/${instances.credentialStore.id}`;
    urls.credentialLibraries = `${urls.credentialStore}/credential-libraries`;
    urls.credentialLibrary = `${urls.credentialLibraries}/${instances.credentialLibrary.id}`;
    urls.newCredentialLibrary = `${urls.credentialLibraries}/new`;
    // Generate resource counter
    getCredentialLibraryCount = () =>
      this.server.schema.credentialLibraries.all().models.length;
    getUsernamePasswordDomainCredentialLibraryCount = () => {
      return this.server.schema.credentialLibraries.where({
        credentialType: TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
      }).length;
    };
    featuresService = this.owner.lookup('service:features');
  });

  test('visiting credential libraries', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.credentialLibraries);

    assert.strictEqual(currentURL(), urls.credentialLibraries);

    await visit(urls.credentialLibrary);

    assert.strictEqual(currentURL(), urls.credentialLibrary);
  });

  test('can create a new credential library of type vault generic', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const count = getCredentialLibraryCount();
    await visit(urls.newCredentialLibrary);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await select(
      selectors.FIELD_CRED_TYPE,
      selectors.FIELD_CRED_TYPE_SSH_VALUE,
    );
    await select(
      selectors.FIELD_CRED_MAP_OVERRIDES_SELECT,
      selectors.FIELD_CRED_MAP_OVERRIDES_SELECT_SSH_VALUE,
    );
    await fillIn(selectors.FIELD_CRED_MAP_OVERRIDES_INPUT, 'key');
    await click(selectors.FIELD_CRED_MAP_OVERRIDES_BTN);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(getCredentialLibraryCount(), count + 1);
    const credentialLibrary = this.server.schema.credentialLibraries.findBy({
      name: commonSelectors.FIELD_NAME_VALUE,
    });
    assert.strictEqual(
      credentialLibrary.name,
      commonSelectors.FIELD_NAME_VALUE,
    );
    assert.strictEqual(
      credentialLibrary.credentialType,
      selectors.FIELD_CRED_TYPE_SSH_VALUE,
    );
    assert.deepEqual(credentialLibrary.credentialMappingOverrides, {
      private_key_attribute: 'key',
    });
  });

  test('can create a new credential library with username, password and domain type for vault generic', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-26
          enabled: false,
        },
      },
    });

    const credentialLibraryCount = getCredentialLibraryCount();
    const usernamePasswordDomainCredentialLibraryCount =
      getUsernamePasswordDomainCredentialLibraryCount();
    await visit(urls.newCredentialLibrary);

    await fillIn(selectors.FIELD_VAULT_PATH, selectors.FIELD_VAULT_PATH_VALUE);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await select(
      selectors.FIELD_CRED_TYPE,
      selectors.FIELD_CRED_TYPE_UPD_VALUE,
    );

    await select(
      selectors.FIELD_CRED_MAP_OVERRIDES_SELECT,
      selectors.FIELD_CRED_MAP_OVERRIDES_SELECT_DOMAIN_VALUE,
    );
    await fillIn(selectors.FIELD_CRED_MAP_OVERRIDES_INPUT, 'domain');

    await click(selectors.FIELD_CRED_MAP_OVERRIDES_BTN);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(getCredentialLibraryCount(), credentialLibraryCount + 1);
    assert.strictEqual(
      getUsernamePasswordDomainCredentialLibraryCount(),
      usernamePasswordDomainCredentialLibraryCount + 1,
    );

    const credentialLibrary = this.server.schema.credentialLibraries.findBy({
      credentialType: TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
    });

    assert.strictEqual(
      credentialLibrary.name,
      commonSelectors.FIELD_NAME_VALUE,
    );
    assert.strictEqual(
      credentialLibrary.credentialType,
      selectors.FIELD_CRED_TYPE_UPD_VALUE,
    );
    assert.deepEqual(credentialLibrary.credentialMappingOverrides, {
      domain_attribute: 'domain',
    });
  });

  test('can create a new credential library of type vault ssh cert', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('ssh-target');
    const count = getCredentialLibraryCount();
    await visit(urls.newCredentialLibrary);

    await click(selectors.TYPE_VAULT_SSH_CERT);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await fillIn(
      commonSelectors.FIELD_DESCRIPTION,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );
    await fillIn(selectors.FIELD_VAULT_PATH, selectors.FIELD_VAULT_PATH_VALUE);
    await fillIn(selectors.FIELD_USERNAME, selectors.FIELD_USERNAME_VALUE);
    await fillIn(selectors.FIELD_KEY_TYPE, selectors.FIELD_KEY_TYPE_VALUE);
    await fillIn(selectors.FIELD_KEY_BITS, selectors.FIELD_KEY_BITS_VALUE);
    await fillIn(selectors.FIELD_TTL, selectors.FIELD_TTL_VALUE);
    await fillIn(selectors.FIELD_KEY_ID, selectors.FIELD_KEY_ID_VALUE);
    await fillIn(selectors.FIELD_CRIT_OPTS_KEY, 'co_key');
    await fillIn(selectors.FIELD_CRIT_OPTS_VALUE, 'co_value');
    await click(selectors.FIELD_CRIT_OPTS_BTN);
    await fillIn(selectors.FIELD_EXT_KEY, 'ext_key');
    await fillIn(selectors.FIELD_EXT_VALUE, 'ext_value');
    await click(selectors.FIELD_EXT_BTN);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(getCredentialLibraryCount(), count + 1);
    assert.strictEqual(
      this.server.schema.credentialLibraries.where({
        type: TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
      }).length,
      1,
    );
    const credentialLibrary = this.server.schema.credentialLibraries.findBy({
      type: TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
    });
    assert.strictEqual(
      credentialLibrary.name,
      commonSelectors.FIELD_NAME_VALUE,
    );
    assert.strictEqual(
      credentialLibrary.description,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );
    assert.strictEqual(
      credentialLibrary.attributes.path,
      selectors.FIELD_VAULT_PATH_VALUE,
    );
    assert.strictEqual(
      credentialLibrary.attributes.username,
      selectors.FIELD_USERNAME_VALUE,
    );
    assert.strictEqual(
      credentialLibrary.attributes.key_type,
      selectors.FIELD_KEY_TYPE_VALUE,
    );
    assert.strictEqual(
      credentialLibrary.attributes.key_bits,
      selectors.FIELD_KEY_BITS_VALUE,
    );
    assert.strictEqual(
      credentialLibrary.attributes.ttl,
      selectors.FIELD_TTL_VALUE,
    );
    assert.strictEqual(
      credentialLibrary.attributes.key_id,
      selectors.FIELD_KEY_ID_VALUE,
    );
    assert.deepEqual(credentialLibrary.attributes.critical_options, {
      co_key: 'co_value',
    });
    assert.deepEqual(credentialLibrary.attributes.extensions, {
      ext_key: 'ext_value',
    });
  });

  test('ecdsa and rsa key types bring up a key bits field', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('ssh-target');
    await visit(urls.newCredentialLibrary);
    await click(selectors.TYPE_VAULT_SSH_CERT);
    await select(selectors.FIELD_KEY_TYPE, 'ed25519');

    assert.dom(selectors.FIELD_KEY_BITS).doesNotExist();

    await select(selectors.FIELD_KEY_TYPE, 'ecdsa');

    assert.dom(selectors.FIELD_KEY_BITS).isVisible();

    await select(selectors.FIELD_KEY_TYPE, 'rsa');

    assert.dom(selectors.FIELD_KEY_BITS).isVisible();
  });

  test('Users cannot navigate to new credential library route without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.credentialStore.authorized_collection_actions[
      'credential-libraries'
    ] = [];
    await visit(urls.credentialLibraries);
    await click(selectors.MANAGE_DROPDOWN_CREDENTIAL_STORE);

    assert.notOk(
      instances.credentialStore.authorized_collection_actions[
        'credential-libraries'
      ].includes('create'),
    );
    assert.dom(commonSelectors.HREF(urls.newCredentialLibrary)).doesNotExist();
  });

  test('can cancel create a new credential library', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const count = getCredentialLibraryCount();
    await visit(urls.newCredentialLibrary);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.credentialLibraries);
    assert.strictEqual(getCredentialLibraryCount(), count);
  });

  test('saving a new credential library with invalid fields displays error messages', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.server.post('/credential-libraries', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid',
          details: {
            request_fields: [
              {
                name: 'path',
                description: 'Vault path is required',
              },
            ],
          },
        },
      );
    });

    await visit(urls.newCredentialLibrary);
    await click(commonSelectors.SAVE_BTN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid');
    assert
      .dom(selectors.FIELD_VAULT_PATH_ERROR)
      .hasText('Vault path is required');
  });

  test('cannot select vault ssh cert when feature is disabled', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.newCredentialLibrary);

    assert.false(featuresService.isEnabled('ssh-target'));
    assert.dom(selectors.TYPE_VAULT_SSH_CERT).doesNotExist();
  });

  test('users cannot directly navigate to new credential library route without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.credentialStore.authorized_collection_actions[
      'credential-libraries'
    ] = instances.credentialStore.authorized_collection_actions[
      'credential-libraries'
    ].filter((item) => item !== 'create');

    await visit(urls.newCredentialLibrary);

    assert.false(
      instances.credentialStore.authorized_collection_actions[
        'credential-libraries'
      ].includes('create'),
    );
    assert.strictEqual(currentURL(), urls.credentialLibraries);
  });

  test('can create a new credential library of type vault ldap', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-26
          enabled: false,
        },
      },
    });

    await visit(urls.newCredentialLibrary);

    await click(selectors.TYPE_VAULT_LDAP);

    await fillIn(selectors.FIELD_VAULT_PATH, selectors.FIELD_VAULT_PATH_VALUE);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);

    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(
      this.server.schema.credentialLibraries.where({
        type: TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP,
      }).length,
      1,
    );
    const credentialLibrary = this.server.schema.credentialLibraries.findBy({
      type: TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP,
    });

    assert.strictEqual(
      credentialLibrary.name,
      commonSelectors.FIELD_NAME_VALUE,
    );
    assert.strictEqual(
      credentialLibrary.attributes.path,
      selectors.FIELD_VAULT_PATH_VALUE,
    );
  });

  test('default `vault-generic` credential library is selected when `ssh-target` feature is not enabled and user manually sets `type` in the query params', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-26
          enabled: false,
        },
      },
    });

    await visit(`${urls.newCredentialLibrary}?type=vault-ssh-certificate`);

    assert.dom(selectors.TYPE_VAULT_SSH_CERT).isNotVisible();
    assert.dom(selectors.TYPE_VAULT_LDAP).isNotChecked();
    assert.dom(selectors.TYPE_VAULT_GENERIC).isChecked();
  });
});
