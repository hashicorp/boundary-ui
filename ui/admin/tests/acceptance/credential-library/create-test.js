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
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { Response } from 'miragejs';
import { TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE } from 'api/models/credential-library';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | credential-libraries | create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let featuresService;
  let getCredentialLibraryCount;

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
    authenticateSession({ username: 'admin' });
    featuresService = this.owner.lookup('service:features');
  });

  test('visiting credential libraries', async function (assert) {
    await visit(urls.credentialLibraries);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.credentialLibraries);

    await visit(urls.credentialLibrary);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.credentialLibrary);
  });

  test('can create a new credential library of type vault generic', async function (assert) {
    const count = getCredentialLibraryCount();
    await visit(urls.newCredentialLibrary);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await select('[name="credential_type"]', 'ssh_private_key');
    await select(
      '[name="credential_mapping_overrides"] tbody td:nth-of-type(1) select',
      'private_key_attribute',
    );
    await fillIn(
      '[name="credential_mapping_overrides"] tbody td:nth-of-type(2) input',
      'key',
    );
    await click('[name="credential_mapping_overrides"] button');
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(getCredentialLibraryCount(), count + 1);
    const credentialLibrary = this.server.schema.credentialLibraries.findBy({
      name: commonSelectors.FIELD_NAME_VALUE,
    });
    assert.strictEqual(
      credentialLibrary.name,
      commonSelectors.FIELD_NAME_VALUE,
    );
    assert.strictEqual(credentialLibrary.credentialType, 'ssh_private_key');
    assert.deepEqual(credentialLibrary.credentialMappingOverrides, {
      private_key_attribute: 'key',
    });
  });

  test('can create a new credential library of type vault ssh cert', async function (assert) {
    featuresService.enable('ssh-target');
    const count = getCredentialLibraryCount();
    await visit(urls.newCredentialLibrary);

    await click('[value="vault-ssh-certificate"]');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await fillIn(
      commonSelectors.FIELD_DESCRIPTION,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );
    await fillIn('[name="vault_path"]', 'path');
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

  test('ecdsa and rsa key types bring up a key bits field', async function (assert) {
    featuresService.enable('ssh-target');
    await visit(urls.newCredentialLibrary);
    await click('[value="vault-ssh-certificate"]');
    await select('[name="key_type"]', 'ed25519');

    assert.dom('[name="key_bits"]').doesNotExist();

    await select('[name="key_type"]', 'ecdsa');

    assert.dom('[name="key_bits"]').isVisible();

    await select('[name="key_type"]', 'rsa');

    assert.dom('[name="key_bits"]').isVisible();
  });

  test('Users cannot navigate to new credential library route without proper authorization', async function (assert) {
    instances.credentialStore.authorized_collection_actions[
      'credential-libraries'
    ] = [];
    await visit(urls.credentialLibraries);

    assert.notOk(
      instances.credentialStore.authorized_collection_actions[
        'credential-libraries'
      ].includes('create'),
    );
    assert.dom(commonSelectors.HREF(urls.newCredentialLibrary)).doesNotExist();
  });

  test('can cancel create a new credential library', async function (assert) {
    const count = getCredentialLibraryCount();
    await visit(urls.newCredentialLibrary);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.credentialLibraries);
    assert.strictEqual(getCredentialLibraryCount(), count);
  });

  test('saving a new credential library with invalid fields displays error messages', async function (assert) {
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
                name: 'name',
                description: 'Name is required.',
              },
            ],
          },
        },
      );
    });

    await visit(urls.newCredentialLibrary);
    await click(commonSelectors.SAVE_BTN);

    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'The request was invalid.',
    );
    assert.ok(
      find('.hds-form-error__message').textContent.trim(),
      'Name is required.',
    );
  });

  test('cannot select vault ssh cert when feature is disabled', async function (assert) {
    await visit(urls.newCredentialLibrary);

    assert.false(featuresService.isEnabled('ssh-target'));
    assert.dom('[value="vault-ssh-certificate"]').doesNotExist();
  });

  test('users cannot directly navigate to new credential library route without proper authorization', async function (assert) {
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
});
