/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import {
  visit,
  click,
  fillIn,
  currentURL,
  find,
  select,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { Response } from 'miragejs';
import { TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE } from 'api/models/credential-library';

module('Acceptance | credential-libraries | update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const BUTTON_SELECTOR = '.rose-form-actions [type="button"]';
  const SAVE_BTN_SELECTOR = '.rose-form-actions [type="submit"]';
  const NAME_INPUT_SELECTOR = '[name="name"]';
  const FIELD_ERROR_TEXT_SELECTOR = '.hds-form-error__message';
  const DESC_INPUT_SELECTOR = '[name="description"]';
  const VAULT_PATH_SELECTOR = '[name="vault_path"]';
  const CRED_TYPE_SELECTOR = '[name="credential_type"]';
  const CRED_MAPPING_OVERRIDES_SELECT =
    '[name="credential_mapping_overrides"] tbody td:nth-of-type(1) select';
  const CRED_MAPPING_OVERRIDES_INPUT =
    '[name="credential_mapping_overrides"] tbody td:nth-of-type(2) input';
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
  };

  hooks.beforeEach(function () {
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
    authenticateSession({});
  });

  test('cannot update resource without proper authorization', async function (assert) {
    instances.credentialLibrary.authorized_actions =
      instances.credentialLibrary.authorized_actions.filter(
        (item) => item !== 'update',
      );
    await visit(urls.credentialLibrary);
    assert.notOk(find(BUTTON_SELECTOR));
  });

  test('can update a credential library and cancel changes', async function (assert) {
    await visit(urls.credentialLibrary);
    await click(BUTTON_SELECTOR, 'Activate edit mode');
    await fillIn(NAME_INPUT_SELECTOR, 'random string');
    await click(BUTTON_SELECTOR);
    assert.notEqual(
      this.server.schema.credentialLibraries.all().models[0].name,
      'random string',
    );
    assert.strictEqual(
      find(NAME_INPUT_SELECTOR).value,
      instances.credentialLibrary.name,
    );
  });

  test('can update a vault generic credential library and save changes', async function (assert) {
    await visit(
      `${urls.credentialLibraries}/${instances.credentialLibrary.id}`,
    );

    await click(BUTTON_SELECTOR);

    await fillIn(NAME_INPUT_SELECTOR, 'random string');
    await fillIn(DESC_INPUT_SELECTOR, 'description');
    await fillIn(VAULT_PATH_SELECTOR, 'path');

    await select(CRED_MAPPING_OVERRIDES_SELECT, 'private_key_attribute');
    await fillIn(CRED_MAPPING_OVERRIDES_INPUT, 'key');

    await click('[name="credential_mapping_overrides"] button');

    await click(SAVE_BTN_SELECTOR);
    const credentialLibrary = this.server.schema.credentialLibraries.findBy({
      name: 'random string',
    });
    assert.strictEqual(credentialLibrary.name, 'random string');
    assert.strictEqual(credentialLibrary.description, 'description');
    assert.strictEqual(credentialLibrary.attributes.path, 'path');
    assert.deepEqual(credentialLibrary.credentialMappingOverrides, {
      private_key_attribute: 'key',
    });
  });

  test('saving an existing credential library with invalid fields displays error messages', async function (assert) {
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
                name: 'name',
                description: 'Name is required',
              },
            ],
          },
        },
      );
    });
    await visit(urls.credentialLibrary);
    await click(BUTTON_SELECTOR, 'Activate edit mode');
    await fillIn(NAME_INPUT_SELECTOR, 'random string');
    await click(SAVE_BTN_SELECTOR);
    assert
      .dom('[data-test-toast-notification] .hds-alert__description')
      .hasText('The request was invalid.');
    assert.ok(
      find(FIELD_ERROR_TEXT_SELECTOR).textContent.trim(),
      'Name is required.',
    );
  });

  test('can discard unsaved credential library changes via dialog', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.credentialLibrary.name, 'random string');

    await visit(urls.credentialLibrary);
    await click(BUTTON_SELECTOR, 'Activate edit mode');
    await fillIn(NAME_INPUT_SELECTOR, 'random string');
    assert.strictEqual(currentURL(), urls.credentialLibrary);

    try {
      await visit(urls.credentialLibraries);
    } catch (e) {
      assert.ok(find('.rose-dialog'));
      await click('.rose-dialog-footer button:first-child', 'Click Discard');
      assert.strictEqual(currentURL(), urls.credentialLibraries);
      assert.notEqual(
        this.server.schema.credentialLibraries.all().models[0].name,
        'random string',
      );
    }
  });

  test('can cancel discard unsaved credential library via dialog', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.credentialLibrary.name, 'random string');
    await visit(urls.credentialLibrary);
    await click(BUTTON_SELECTOR, 'Activate edit mode');
    await fillIn(NAME_INPUT_SELECTOR, 'random string');
    assert.strictEqual(currentURL(), urls.credentialLibrary);

    try {
      await visit(urls.credentialLibraries);
    } catch (e) {
      assert.ok(find('.rose-dialog'));
      await click('.rose-dialog-footer button:last-child');
      assert.strictEqual(currentURL(), urls.credentialLibrary);
      assert.notEqual(
        this.server.schema.credentialLibraries.all().models[0].name,
        'random string',
      );
    }
  });

  test('cannot update credential type in a vault generic credential library', async function (assert) {
    await visit(urls.credentialLibrary);
    await click(BUTTON_SELECTOR, 'Activate edit mode');
    assert.dom(CRED_TYPE_SELECTOR).isDisabled();
  });

  test('can update a vault ssh cert credential library and save changes', async function (assert) {
    instances.credentialLibrary = this.server.create('credential-library', {
      scope: instances.scopes.project,
      credentialStore: instances.credentialStore,
      type: TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
    });
    await visit(
      `${urls.credentialLibraries}/${instances.credentialLibrary.id}`,
    );
    await click(BUTTON_SELECTOR, 'Activate edit mode');
    await fillIn(NAME_INPUT_SELECTOR, 'name');
    await fillIn(DESC_INPUT_SELECTOR, 'description');
    await fillIn(VAULT_PATH_SELECTOR, 'path');
    await fillIn('[name="username"]', 'username');
    await select('[name="key_type"]', 'rsa');
    await fillIn('[name="key_bits"]', 100);
    await fillIn('[name="ttl"]', 'ttl');
    await fillIn('[name="key_id"]', 'key_id');
    await fillIn(
      '[name="critical_options"] tbody td:nth-of-type(1) input',
      'co_key',
    );
    await fillIn(
      '[name="critical_options"] tbody td:nth-of-type(2) input',
      'co_value',
    );
    await click('[name="critical_options"] button');
    await fillIn(
      '[name="extensions"] tbody td:nth-of-type(1) input',
      'ext_key',
    );
    await fillIn(
      '[name="extensions"] tbody td:nth-of-type(2) input',
      'ext_value',
    );

    await click('[name="extensions"] button');

    await click(SAVE_BTN_SELECTOR);
    const credentialLibrary = this.server.schema.credentialLibraries.findBy({
      type: TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
    });
    assert.strictEqual(credentialLibrary.name, 'name');
    assert.strictEqual(credentialLibrary.description, 'description');
    assert.strictEqual(credentialLibrary.attributes.path, 'path');
    assert.strictEqual(credentialLibrary.attributes.username, 'username');
    assert.strictEqual(credentialLibrary.attributes.key_type, 'rsa');
    assert.strictEqual(credentialLibrary.attributes.key_bits, 100);
    assert.strictEqual(credentialLibrary.attributes.ttl, 'ttl');
    assert.strictEqual(credentialLibrary.attributes.key_id, 'key_id');
    assert.deepEqual(credentialLibrary.attributes.critical_options, {
      co_key: 'co_value',
    });
    assert.deepEqual(credentialLibrary.attributes.extensions, {
      ext_key: 'ext_value',
    });
  });
});
