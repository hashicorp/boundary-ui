/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, fillIn, currentURL, select } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { Response } from 'miragejs';
import {
  TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
  TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
} from 'api/models/credential-library';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';
import { TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN } from 'api/models/credential';

module('Acceptance | credential-libraries | update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);

  const instances = {
    scopes: {
      global: null,
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
    unknownCredentialLibrary: null,
    usernamePasswordDomainCredentialLibrary: null,
  };

  hooks.beforeEach(async function () {
    // Generate resources
    instances.scopes.global = this.server.create('scope', { id: 'global' });
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
    });
    instances.usernamePasswordDomainCredentialLibrary = this.server.create(
      'credential-library',
      {
        scope: instances.scopes.project,
        credentialStore: instances.credentialStore,
        type: TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
        credential_type: TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
      },
    );
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.credentialStores = `${urls.projectScope}/credential-stores`;
    urls.credentialStore = `${urls.credentialStores}/${instances.credentialStore.id}`;
    urls.credentialLibraries = `${urls.credentialStore}/credential-libraries`;
    urls.credentialLibrary = `${urls.credentialLibraries}/${instances.credentialLibrary.id}`;
    urls.newCredentialLibrary = `${urls.credentialLibraries}/new`;
    urls.unknownCredentialLibrary = `${urls.credentialLibraries}/foo`;
    urls.usernamePasswordDomainCredentialLibrary = `${urls.credentialLibraries}/${instances.usernamePasswordDomainCredentialLibrary.id}`;
    await authenticateSession({});
  });

  test('cannot update resource without proper authorization', async function (assert) {
    instances.credentialLibrary.authorized_actions =
      instances.credentialLibrary.authorized_actions.filter(
        (item) => item !== 'update',
      );

    await visit(urls.credentialLibrary);

    assert.dom(commonSelectors.EDIT_BTN).doesNotExist();
  });

  test('can update a credential library and cancel changes', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.credentialLibrary);
    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.notEqual(
      this.server.schema.credentialLibraries.all().models[0].name,
      commonSelectors.FIELD_NAME_VALUE,
    );
    assert
      .dom(commonSelectors.FIELD_NAME)
      .hasValue(instances.credentialLibrary.name);
  });

  test('can update a vault generic credential library and save changes', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.credentialLibrary);

    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await fillIn(
      commonSelectors.FIELD_DESCRIPTION,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );
    await fillIn(selectors.FIELD_VAULT_PATH, selectors.FIELD_VAULT_PATH_VALUE);
    await select(
      selectors.FIELD_CRED_MAP_OVERRIDES_SELECT,
      selectors.FIELD_CRED_MAP_OVERRIDES_SELECT_SSH_VALUE,
    );
    await fillIn(selectors.FIELD_CRED_MAP_OVERRIDES_INPUT, 'key');
    await click(selectors.FIELD_CRED_MAP_OVERRIDES_BTN);
    await click(commonSelectors.SAVE_BTN);

    const credentialLibrary = this.server.schema.credentialLibraries.findBy({
      name: commonSelectors.FIELD_NAME_VALUE,
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
    assert.deepEqual(credentialLibrary.credentialMappingOverrides, {
      private_key_attribute: 'key',
    });
  });

  test('can update a vault generic credential library of username, password and domain type and save changes', async function (assert) {
    await visit(urls.usernamePasswordDomainCredentialLibrary);

    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await fillIn(
      commonSelectors.FIELD_DESCRIPTION,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );
    await fillIn(selectors.FIELD_VAULT_PATH, selectors.FIELD_VAULT_PATH_VALUE);
    await select(
      selectors.FIELD_CRED_MAP_OVERRIDES_SELECT,
      selectors.FIELD_CRED_MAP_OVERRIDES_SELECT_DOMAIN_VALUE,
    );
    await fillIn(selectors.FIELD_CRED_MAP_OVERRIDES_INPUT, 'domain');

    await click(selectors.FIELD_CRED_MAP_OVERRIDES_BTN);
    await click(commonSelectors.SAVE_BTN);

    const credentialLibrary = this.server.schema.credentialLibraries.findBy({
      credentialType: TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
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
    assert.deepEqual(credentialLibrary.credentialMappingOverrides, {
      domain_attribute: 'domain',
    });
  });

  test('saving an existing credential library with invalid fields displays error messages', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.server.patch('/credential-libraries/:id', () => {
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
                name: 'path',
                description: 'Vault path is required',
              },
            ],
          },
        },
      );
    });
    await visit(urls.credentialLibrary);
    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
    assert
      .dom(selectors.FIELD_VAULT_PATH_ERROR)
      .hasText('Vault path is required');
  });

  test('can discard unsaved credential library changes via dialog', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;

    assert.notEqual(
      instances.credentialLibrary.name,
      commonSelectors.FIELD_NAME_VALUE,
    );

    await visit(urls.credentialLibrary);
    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);

    assert.strictEqual(currentURL(), urls.credentialLibrary);

    try {
      await visit(urls.credentialLibraries);
    } catch (e) {
      assert.dom(commonSelectors.MODAL_WARNING).isVisible();

      await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN);

      assert.strictEqual(currentURL(), urls.credentialLibraries);
      assert.notEqual(
        this.server.schema.credentialLibraries.all().models[0].name,
        commonSelectors.FIELD_NAME_VALUE,
      );
    }
  });

  test('can cancel discard unsaved credential library via dialog', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;

    assert.notEqual(
      instances.credentialLibrary.name,
      commonSelectors.FIELD_NAME_VALUE,
    );

    await visit(urls.credentialLibrary);
    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);

    assert.strictEqual(currentURL(), urls.credentialLibrary);

    try {
      await visit(urls.credentialLibraries);
    } catch {
      assert.dom(commonSelectors.MODAL_WARNING).isVisible();

      await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);

      assert.strictEqual(currentURL(), urls.credentialLibrary);
      assert.notEqual(
        this.server.schema.credentialLibraries.all().models[0].name,
        commonSelectors.FIELD_NAME_VALUE,
      );
    }
  });

  test('cannot update credential type in a vault generic credential library', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.credentialLibrary);
    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');

    assert.dom(selectors.FIELD_CRED_TYPE).doesNotExist();
  });

  test('can update a vault ssh cert credential library and save changes', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.credentialLibrary = this.server.create('credential-library', {
      scope: instances.scopes.project,
      credentialStore: instances.credentialStore,
      type: TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
    });
    await visit(
      `${urls.credentialLibraries}/${instances.credentialLibrary.id}`,
    );
    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
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
});
