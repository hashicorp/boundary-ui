/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitUntil } from '@ember/test-helpers';
import { visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { authenticateSession } from 'ember-simple-auth/test-support';
import {
  TYPE_AUTH_METHOD_PASSWORD,
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
} from 'api/models/auth-method';

module('Unit | Controller | scopes/scope/auth-methods/index', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let store;
  let controller;
  let getAuthMethodCount;

  const instances = {
    scope: {
      global: null,
    },
    authMethod: null,
  };

  hooks.beforeEach(async function () {
    authenticateSession({});
    store = this.owner.lookup('service:store');
    controller = this.owner.lookup(
      'controller:scopes/scope/auth-methods/index',
    );

    instances.scope.global = this.server.create('scope', { id: 'global' });
    instances.authMethod = this.server.create('auth-method', {
      scopeId: 'global',
    });

    getAuthMethodCount = () =>
      this.server.schema.authMethods.all().models.length;
  });

  test('controller exists', function (assert) {
    assert.ok(controller);
  });

  test('primaryOptions returns expected object', function (assert) {
    assert.deepEqual(controller.primaryOptions, [
      { id: 'true', name: 'Yes' },
      { id: 'false', name: 'No' },
    ]);
  });

  test('authMethodTypeOptions returns expected object', function (assert) {
    assert.deepEqual(controller.authMethodTypeOptions, [
      { id: TYPE_AUTH_METHOD_PASSWORD, name: 'Password' },
      { id: TYPE_AUTH_METHOD_OIDC, name: 'OIDC' },
      { id: TYPE_AUTH_METHOD_LDAP, name: 'LDAP' },
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
    const selectedItems = ['true'];
    controller.applyFilter('primary', selectedItems);

    assert.strictEqual(controller.page, 1);
    assert.deepEqual(controller.primary, selectedItems);
  });

  test('cancel action rolls-back changes on the specified model', async function (assert) {
    await visit('/scopes/global/auth-methods');
    const authMethodModelBefore = await store.findRecord(
      'auth-method',
      instances.authMethod.id,
    );
    authMethodModelBefore.name = 'test';

    assert.strictEqual(authMethodModelBefore.name, 'test');

    await controller.cancel(authMethodModelBefore);
    const authMethodModelAfter = await store.findRecord(
      'auth-method',
      instances.authMethod.id,
    );

    assert.notEqual(authMethodModelAfter.name, 'test');
    assert.strictEqual(authMethodModelAfter.name, authMethodModelBefore.name);
  });

  test('save action saves changes on the specified model', async function (assert) {
    await visit('/scopes/global/auth-methods');
    const authMethodModelBefore = await store.findRecord(
      'auth-method',
      instances.authMethod.id,
    );
    authMethodModelBefore.name = 'test';

    await controller.save(authMethodModelBefore);
    const authMethodModelAfter = await store.findRecord(
      'auth-method',
      instances.authMethod.id,
    );

    assert.strictEqual(authMethodModelAfter.name, 'test');
  });

  test('delete action destroys specified model', async function (assert) {
    await visit('/scopes/global/scopes');
    const authMethodModel = await store.findRecord(
      'auth-method',
      instances.authMethod.id,
    );
    const authMethodCount = getAuthMethodCount();

    await controller.delete(authMethodModel);

    assert.strictEqual(getAuthMethodCount(), authMethodCount - 1);
  });

  test('makePrimary action updates scope with auth-method id', async function (assert) {
    await visit('/scopes/global/auth-methods');
    const authMethodModel = await store.findRecord(
      'auth-method',
      instances.authMethod.id,
    );

    await controller.makePrimary(authMethodModel);
    const scopeModel = await store.findRecord(
      'scope',
      instances.scope.global.id,
    );

    assert.strictEqual(
      scopeModel.primary_auth_method_id,
      instances.authMethod.id,
    );
  });

  test('removeAsPrimary action updates scope with null as auth-method id', async function (assert) {
    await visit('/scopes/global/auth-methods');
    const authMethodModel = await store.findRecord(
      'auth-method',
      instances.authMethod.id,
    );

    await controller.removeAsPrimary(authMethodModel);
    const scopeModel = await store.findRecord(
      'scope',
      instances.scope.global.id,
    );

    assert.notOk(scopeModel.primary_auth_method_id);
  });

  test('addStringItem action adds item to field and removeItemByIndex removes correct item', async function (assert) {
    const authMethodModel = await store.findRecord(
      'auth-method',
      instances.authMethod.id,
    );

    controller.addStringItem(authMethodModel, 'certificates', 'cert_123');

    assert.deepEqual(authMethodModel.certificates, [{ value: 'cert_123' }]);

    controller.addStringItem(authMethodModel, 'certificates', 'cert_456');
    controller.removeItemByIndex(authMethodModel, 'certificates', 0);

    assert.deepEqual(authMethodModel.certificates, [{ value: 'cert_456' }]);
  });

  test('addAccountMapItem action adds item to field and removeItemByIndex removes correct item', async function (assert) {
    const authMethodModel = await store.findRecord(
      'auth-method',
      instances.authMethod.id,
    );

    controller.addAccountMapItem(
      authMethodModel,
      'account_attribute_maps',
      'name123',
      'fullName',
    );

    assert.deepEqual(authMethodModel.account_attribute_maps, [
      { key: 'name123', value: 'fullName' },
    ]);

    controller.addAccountMapItem(
      authMethodModel,
      'account_attribute_maps',
      'name456',
      'fullName',
    );
    controller.removeItemByIndex(authMethodModel, 'account_attribute_maps', 0);

    assert.deepEqual(authMethodModel.account_attribute_maps, [
      { key: 'name456', value: 'fullName' },
    ]);
  });

  test('edit action updates to a dirty state', async function (assert) {
    const authMethodModel = await store.findRecord(
      'auth-method',
      instances.authMethod.id,
    );

    assert.false(authMethodModel.hasDirtyAttributes);

    controller.edit(authMethodModel);

    assert.true(authMethodModel.hasDirtyAttributes);
  });

  test('changeState action updates state of auth-method', async function (assert) {
    instances.authMethod.update({ type: TYPE_AUTH_METHOD_LDAP });
    const authMethodModelBefore = await store.findRecord(
      'auth-method',
      instances.authMethod.id,
    );

    assert.notOk(authMethodModelBefore.state);

    await controller.changeState(authMethodModelBefore, 'public');

    const authMethodModelAfter = await store.findRecord(
      'auth-method',
      instances.authMethod.id,
    );

    assert.strictEqual(authMethodModelAfter.state, 'public');
  });
});
