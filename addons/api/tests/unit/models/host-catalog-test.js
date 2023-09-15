/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  TYPE_HOST_CATALOG_STATIC,
  TYPE_HOST_CATALOG_PLUGIN,
  TYPE_PLUGIN_AWS,
  TYPE_PLUGIN_AZURE,
} from 'api/models/host-catalog';

module('Unit | Model | host catalog', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('host-catalog', {});
    assert.ok(model);
  });

  test('it has isStatic property and returns the expected values', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('host-catalog', {
      compositeType: TYPE_PLUGIN_AWS,
    });
    const modelB = store.createRecord('host-catalog', {
      compositeType: 'foobar',
    });
    const modelC = store.createRecord('host-catalog', {
      compositeType: TYPE_HOST_CATALOG_STATIC,
    });
    assert.false(modelA.isStatic);
    assert.false(modelB.isStatic);
    assert.true(modelC.isStatic);
  });

  test('it has isPlugin property and returns the expected values', async function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const modelPlugin = store.createRecord('host-catalog', {
      compositeType: TYPE_PLUGIN_AWS,
    });
    const modelStatic = store.createRecord('host-catalog', {
      compositeType: TYPE_HOST_CATALOG_STATIC,
    });
    assert.true(modelPlugin.isPlugin);
    assert.false(modelStatic.isPlugin);
  });

  test('it has isUnknown property and returns the expected values', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('host-catalog', {
      compositeType: TYPE_HOST_CATALOG_STATIC,
    });
    const modelB = store.createRecord('host-catalog', {
      compositeType: TYPE_PLUGIN_AWS,
    });
    const modelC = store.createRecord('host-catalog', {
      compositeType: 'no-such-type',
    });
    assert.false(modelA.isUnknown);
    assert.false(modelB.isUnknown);
    assert.true(modelC.isUnknown);
  });

  test('it has isAWS property and returns the expected values', async function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const modelAws = store.createRecord('host-catalog', {
      type: TYPE_HOST_CATALOG_PLUGIN,
      plugin: { name: TYPE_PLUGIN_AWS },
    });
    const modelRandom = store.createRecord('host-catalog', {
      plugin: { name: 'random' },
    });
    assert.true(modelAws.isAWS);
    assert.false(modelRandom.isAWS);
  });

  test('it has isAzure property and return the expected values', async function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const modelAzure = store.createRecord('host-catalog', {
      type: TYPE_HOST_CATALOG_PLUGIN,
      plugin: { name: TYPE_PLUGIN_AZURE },
    });
    const modelRandom = store.createRecord('host-catalog', {
      plugin: { name: 'random' },
    });
    assert.true(modelAzure.isAzure);
    assert.false(modelRandom.isAzure);
  });

  test('get compositeType returns expected values', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('host-catalog', {
      type: TYPE_HOST_CATALOG_STATIC,
    });
    const modelB = store.createRecord('host-catalog', {
      type: TYPE_HOST_CATALOG_PLUGIN,
      plugin: { name: TYPE_PLUGIN_AWS },
    });
    const modelC = store.createRecord('host-catalog', {
      type: TYPE_HOST_CATALOG_PLUGIN,
      plugin: { name: 'no-such-type' },
    });
    assert.strictEqual(modelA.compositeType, TYPE_HOST_CATALOG_STATIC);
    assert.strictEqual(modelB.compositeType, TYPE_PLUGIN_AWS);
    assert.strictEqual(modelC.compositeType, 'unknown');
  });

  test('set compositeType sets expected values', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const modelPlugin = store.createRecord('host-catalog', {
      compositeType: TYPE_PLUGIN_AWS,
    });
    const modelStatic = store.createRecord('host-catalog', {
      compositeType: TYPE_HOST_CATALOG_STATIC,
    });
    assert.strictEqual(modelPlugin.type, TYPE_HOST_CATALOG_PLUGIN);
    assert.strictEqual(modelPlugin.plugin.name, TYPE_PLUGIN_AWS);
    assert.strictEqual(modelStatic.type, TYPE_HOST_CATALOG_STATIC);
  });
});
