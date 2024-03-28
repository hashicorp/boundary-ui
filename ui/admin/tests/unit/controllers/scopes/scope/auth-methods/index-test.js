/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitUntil } from '@ember/test-helpers';
import {
  TYPE_AUTH_METHOD_PASSWORD,
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
} from 'api/models/auth-method';

module('Unit | Controller | scopes/scope/auth-methods/index', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let controller = this.owner.lookup(
      'controller:scopes/scope/auth-methods/index',
    );
    assert.ok(controller);
  });

  test('primaryOptions returns expected object', function (assert) {
    let controller = this.owner.lookup(
      'controller:scopes/scope/auth-methods/index',
    );
    assert.deepEqual(controller.primaryOptions, [
      { id: 'true', name: 'Yes' },
      { id: 'false', name: 'No' },
    ]);
  });

  test('authMethodTypeOptions returns expected object', function (assert) {
    let controller = this.owner.lookup(
      'controller:scopes/scope/auth-methods/index',
    );
    assert.deepEqual(controller.authMethodTypeOptions, [
      { id: TYPE_AUTH_METHOD_PASSWORD, name: 'Password' },
      { id: TYPE_AUTH_METHOD_OIDC, name: 'OIDC' },
      { id: TYPE_AUTH_METHOD_LDAP, name: 'LDAP' },
    ]);
  });

  test('filters returns expected entries', function (assert) {
    let controller = this.owner.lookup(
      'controller:scopes/scope/auth-methods/index',
    );
    assert.ok(controller.filters.allFilters);
    assert.ok(controller.filters.selectedFilters);
  });

  test('handleSearchInput action sets expected values correctly', async function (assert) {
    let controller = this.owner.lookup(
      'controller:scopes/scope/auth-methods/index',
    );
    const searchValue = 'test';
    controller.handleSearchInput({ target: { value: searchValue } });
    await waitUntil(() => controller.search === searchValue);

    assert.strictEqual(controller.page, 1);
    assert.strictEqual(controller.search, searchValue);
  });

  test('applyFilter action sets expected values correctly', async function (assert) {
    let controller = this.owner.lookup(
      'controller:scopes/scope/auth-methods/index',
    );
    const selectedItems = ['true'];
    controller.applyFilter('primary', selectedItems);

    assert.strictEqual(controller.page, 1);
    assert.deepEqual(controller.primary, selectedItems);
  });
});
