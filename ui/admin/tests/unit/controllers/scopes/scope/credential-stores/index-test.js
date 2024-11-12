/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { waitUntil, visit } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import {
  TYPE_CREDENTIAL_STORE_STATIC,
  TYPE_CREDENTIAL_STORE_VAULT,
} from 'api/models/credential-store';

module(
  'Unit | Controller | scopes/scope/credential-stores/index',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupIndexedDb(hooks);
    setupIntl(hooks, 'en-us');

    let controller;
    let store;
    let getCredentialStoreCount;

    const instances = {
      scopes: {
        global: null,
        org: null,
        project: null,
      },
      credentialStore: null,
    };

    const urls = {
      credentialStores: null,
    };

    hooks.beforeEach(function () {
      authenticateSession({});
      controller = this.owner.lookup(
        'controller:scopes/scope/credential-stores/index',
      );
      store = this.owner.lookup('service:store');

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

      urls.credentialStores = `scopes/${instances.scopes.project.id}/credential-stores`;

      getCredentialStoreCount = () =>
        this.server.schema.credentialStores.all().models.length;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
    });

    test('cancel action rolls-back changes on the specified model', async function (assert) {
      await visit(urls.credentialStores);
      const credentialStore = await store.findRecord(
        'credential-store',
        instances.credentialStore.id,
      );
      credentialStore.name = 'test';

      assert.strictEqual(credentialStore.name, 'test');

      await controller.cancel(credentialStore);

      assert.notEqual(credentialStore.name, 'test');
    });

    test('save action saves changes on the specified model', async function (assert) {
      await visit(urls.credentialStores);
      const credentialStore = await store.findRecord(
        'credential-store',
        instances.credentialStore.id,
      );
      credentialStore.name = 'test';

      await controller.save(credentialStore);

      assert.strictEqual(credentialStore.name, 'test');
    });

    test('delete action destroys specified model', async function (assert) {
      const credentialStore = await store.findRecord(
        'credential-store',
        instances.credentialStore.id,
      );
      const credentialStoreCount = getCredentialStoreCount();

      await controller.delete(credentialStore);

      assert.strictEqual(getCredentialStoreCount(), credentialStoreCount - 1);
    });

    test('credStoreTypeOptions returns expected object', function (assert) {
      assert.deepEqual(controller.credStoreTypeOptions, [
        { id: TYPE_CREDENTIAL_STORE_STATIC, name: 'Static' },
        { id: TYPE_CREDENTIAL_STORE_VAULT, name: 'Vault' },
      ]);
    });

    test('filters returns expected entries', function (assert) {
      assert.ok(controller.filters.allFilters);
      assert.ok(controller.filters.selectedFilters);
    });

    test('handleSearchInput action sets expected values correctly', async function (assert) {
      const searchValue = 'test';
      controller.handleSearchInput({ target: { value: searchValue } });
      await waitUntil(() => controller.search === searchValue);

      assert.strictEqual(controller.page, 1);
      assert.strictEqual(controller.search, searchValue);
    });

    test('applyFilter action sets expected values correctly', async function (assert) {
      const selectedItems = ['vault'];
      controller.applyFilter('types', selectedItems);

      assert.strictEqual(controller.page, 1);
      assert.deepEqual(controller.types, selectedItems);
    });
  },
);
