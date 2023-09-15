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

module('Unit | Model | host', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    assert.expect(1);
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('host', {});
    assert.ok(model);
  });

  test('it contains attributes', function (assert) {
    assert.expect(1);
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('host', {
      type: TYPE_HOST_CATALOG_STATIC,
      attributes: {
        address: '127.0.0.1',
      },
    });
    assert.strictEqual(model.attributes.address, '127.0.0.1');
  });

  test('it has isStatic and returns the expected values', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('host', {
      type: TYPE_HOST_CATALOG_STATIC,
    });
    const modelB = store.createRecord('host', {
      type: TYPE_HOST_CATALOG_PLUGIN,
    });
    assert.strictEqual(typeof modelA.isStatic, 'boolean');
    assert.true(modelA.isStatic);
    assert.false(modelB.isStatic);
  });

  test('it has isPlugin and returns the expected values', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const modelPlugin = store.createRecord('host', {
      type: TYPE_HOST_CATALOG_PLUGIN,
    });
    const modelStatic = store.createRecord('host', {
      type: TYPE_HOST_CATALOG_STATIC,
    });
    assert.strictEqual(typeof modelPlugin.isPlugin, 'boolean');
    assert.true(modelPlugin.isPlugin);
    assert.false(modelStatic.isPlugin);
  });

  test('it has isAWS and returns the expected values', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const modelAws = store.createRecord('host', {
      type: 'plugin',
      plugin: { name: 'aws' },
    });
    const modelRandom = store.createRecord('host', {
      plugin: { name: 'random' },
    });
    assert.strictEqual(typeof modelAws.isAWS, 'boolean');
    assert.true(modelAws.isAWS);
    assert.false(modelRandom.isAWS);
  });

  test('it has isAzure and returns the expected values', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const modelAzure = store.createRecord('host', {
      type: TYPE_HOST_CATALOG_PLUGIN,
      plugin: { name: TYPE_PLUGIN_AZURE },
    });
    const modelRandom = store.createRecord('host', {
      plugin: { name: 'random' },
    });
    assert.strictEqual(typeof modelAzure.isAzure, 'boolean');
    assert.true(modelAzure.isAzure);
    assert.false(modelRandom.isAzure);
  });

  test('get compositeType returns expected values', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const modelPlugin = store.createRecord('host', {
      type: TYPE_HOST_CATALOG_PLUGIN,
      plugin: { name: 'Test name' },
    });
    const modelStatic = store.createRecord('host', {
      type: TYPE_HOST_CATALOG_STATIC,
    });
    assert.strictEqual(typeof modelPlugin.compositeType, 'string');
    assert.strictEqual(modelPlugin.compositeType, 'Test name');
    assert.strictEqual(modelStatic.compositeType, TYPE_HOST_CATALOG_STATIC);
  });

  test('set compositeType sets expected values', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const modelPlugin = store.createRecord('host', {
      compositeType: TYPE_PLUGIN_AWS,
    });
    const modelStatic = store.createRecord('host', {
      compositeType: TYPE_HOST_CATALOG_STATIC,
    });

    assert.strictEqual(modelPlugin.type, TYPE_HOST_CATALOG_PLUGIN);
    assert.strictEqual(modelPlugin.plugin.name, TYPE_PLUGIN_AWS);
    assert.strictEqual(modelStatic.type, TYPE_HOST_CATALOG_STATIC);
  });
});
