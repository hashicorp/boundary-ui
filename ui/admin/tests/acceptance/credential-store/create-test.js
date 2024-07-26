/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, find, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { Response } from 'miragejs';

module('Acceptance | credential-stores | create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let featuresService;
  let getCredentialStoresCount;
  let getStaticCredentialStoresCount;
  let getVaultCredentialStoresCount;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
  };

  const urls = {
    globalScope: null,
    projectScope: null,
    credentialStores: null,
    newCredentialStore: null,
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
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.credentialStores = `${urls.projectScope}/credential-stores`;
    urls.newCredentialStore = `${urls.credentialStores}/new`;
    // Generate resource counter
    getCredentialStoresCount = () => {
      return this.server.schema.credentialStores.all().models.length;
    };
    getStaticCredentialStoresCount = () => {
      return this.server.schema.credentialStores.where({ type: 'static' })
        .models.length;
    };
    getVaultCredentialStoresCount = () => {
      return this.server.schema.credentialStores.where({ type: 'vault' }).models
        .length;
    };
    authenticateSession({});
    featuresService = this.owner.lookup('service:features');
  });

  test('Users can create a new credential store of default type static', async function (assert) {
    featuresService.enable('static-credentials');
    const count = getStaticCredentialStoresCount();
    await visit(urls.newCredentialStore);
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');
    assert.strictEqual(getStaticCredentialStoresCount(), count + 1);
  });

  test('Users can create a new credential store of type vault', async function (assert) {
    featuresService.enable('static-credentials');
    const count = getVaultCredentialStoresCount();
    await visit(urls.newCredentialStore);
    await fillIn('[name="name"]', 'random string');
    await click('[value="vault"]');
    await click('[type="submit"]');
    assert.strictEqual(getVaultCredentialStoresCount(), count + 1);
  });

  test('Users can cancel create new credential stores', async function (assert) {
    const count = getCredentialStoresCount();
    await visit(urls.newCredentialStore);
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.strictEqual(currentURL(), urls.credentialStores);
    assert.strictEqual(getCredentialStoresCount(), count);
  });

  test('Users cannot navigate to new credential stores route without proper authorization', async function (assert) {
    instances.scopes.project.authorized_collection_actions[
      'credential-stores'
    ] = [];
    await visit(urls.credentialStores);
    assert.notOk(
      instances.scopes.project.authorized_collection_actions[
        'credential-stores'
      ].includes('create'),
    );
    assert.notOk(find(`[href="${urls.newCredentialStore}"]`));
  });

  test('saving a new credential store with invalid fields displays error messages', async function (assert) {
    this.server.post('/credential-stores', () => {
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
        },
      );
    });
    await visit(urls.newCredentialStore);
    await click('[type="submit"]');
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'The request was invalid.',
    );
    assert.ok(
      find('[data-test-error-message-name]').textContent.trim(),
      'Name is required.',
    );
  });

  test('Users can link to docs page for new credential store', async function (assert) {
    await visit(urls.newCredentialStore);
    assert.ok(
      find(
        `[href="https://developer.hashicorp.com/boundary/docs/concepts/domain-model/credential-stores"]`,
      ),
    );
  });

  test('users cannot directly navigate to new credential store route without proper authorization', async function (assert) {
    instances.scopes.project.authorized_collection_actions[
      'credential-stores'
    ] = instances.scopes.project.authorized_collection_actions[
      'credential-stores'
    ].filter((item) => item !== 'create');

    await visit(urls.newCredentialStore);

    assert.false(
      instances.scopes.project.authorized_collection_actions[
        'credential-stores'
      ].includes('create'),
    );
    assert.strictEqual(currentURL(), urls.credentialStores);
  });
});
