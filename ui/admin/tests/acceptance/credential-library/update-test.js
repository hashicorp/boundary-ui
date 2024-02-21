/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
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
import { authenticateSession } from 'ember-simple-auth/test-support';
import { Response } from 'miragejs';
import { TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE } from 'api/models/credential-library';

module('Acceptance | credential-libraries | update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

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

  test('can update resource and save changes', async function (assert) {
    assert.notEqual(instances.credentialLibrary.name, 'random string');
    await visit(urls.credentialLibrary);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="submit"]');
    assert.strictEqual(currentURL(), urls.credentialLibrary);
    assert.strictEqual(
      this.server.schema.credentialLibraries.all().models[0].name,
      'random string',
    );
  });

  test('cannot update resource without proper authorization', async function (assert) {
    instances.credentialLibrary.authorized_actions =
      instances.credentialLibrary.authorized_actions.filter(
        (item) => item !== 'update',
      );
    await visit(urls.credentialLibrary);
    assert.notOk(find('form [type="button"]'));
  });

  test('can update a credential library and cancel changes', async function (assert) {
    await visit(urls.credentialLibrary);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.notEqual(
      this.server.schema.credentialLibraries.all().models[0].name,
      'random string',
    );
    assert.strictEqual(
      find('[name="name"]').value,
      instances.credentialLibrary.name,
    );
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
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'The request was invalid.',
    );
    assert.ok(
      find('.hds-form-error__message').textContent.trim(),
      'Name is required.',
    );
  });

  test('can discard unsaved credential library changes via dialog', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.credentialLibrary.name, 'random string');

    await visit(urls.credentialLibrary);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
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
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
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
    await click('form [type="button"]', 'Activate edit mode');
    assert.dom('[name=credential_type]').isDisabled();
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
    await click('form [type="button"]:not(:disabled)', 'Activate edit mode');
    await fillIn('[name="name"]', 'name');
    await fillIn('[name="description"]', 'description');
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
    await click('[type="submit"]');
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
