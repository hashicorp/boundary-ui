/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { waitUntil } from '@ember/test-helpers';
import {
  TYPE_CREDENTIAL_STORE_STATIC,
  TYPE_CREDENTIAL_STORE_VAULT,
} from 'api/models/credential-store';

module(
  'Unit | Controller | scopes/scope/credential-stores/index',
  function (hooks) {
    setupTest(hooks);
    setupIntl(hooks, 'en-us');

    let controller;

    hooks.beforeEach(function () {
      controller = this.owner.lookup(
        'controller:scopes/scope/credential-stores/index',
      );
    });

    test('it exists', function (assert) {
      assert.ok(controller);
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
