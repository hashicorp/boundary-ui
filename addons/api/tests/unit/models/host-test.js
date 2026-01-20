/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | host', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('host', {});
    assert.ok(model);
  });

  test('it contains attributes', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('host', {
      type: 'static',
      attributes: {
        address: '127.0.0.1',
      },
    });
    assert.strictEqual(model.attributes.address, '127.0.0.1');
  });

  test('it has isStatic and returns the expected values', async function (assert) {
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('host', { type: 'static' });
    const modelB = store.createRecord('host', { type: 'plugin' });
    assert.strictEqual(typeof modelA.isStatic, 'boolean');
    assert.true(modelA.isStatic);
    assert.false(modelB.isStatic);
  });

  test('it has isPlugin and returns the expected values', async function (assert) {
    const store = this.owner.lookup('service:store');
    const modelPlugin = store.createRecord('host', { type: 'plugin' });
    const modelStatic = store.createRecord('host', { type: 'static' });
    assert.strictEqual(typeof modelPlugin.isPlugin, 'boolean');
    assert.true(modelPlugin.isPlugin);
    assert.false(modelStatic.isPlugin);
  });

  test('it has isUnknown and returns the expected values', async function (assert) {
    const store = this.owner.lookup('service:store');
    const modelAws = store.createRecord('host', {
      type: 'plugin',
      plugin: { name: 'aws' },
    });
    const modelAzure = store.createRecord('host', {
      type: 'plugin',
      plugin: { name: 'azure' },
    });
    const modelRandom = store.createRecord('host', {
      type: 'plugin',
      plugin: { name: 'random' },
    });

    assert.strictEqual(typeof modelRandom.isUnknown, 'boolean');
    assert.true(modelRandom.isUnknown);
    assert.false(modelAws.isUnknown);
    assert.false(modelAzure.isUnknown);
  });

  test('it has isAWS and returns the expected values', async function (assert) {
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
    const store = this.owner.lookup('service:store');
    const modelAzure = store.createRecord('host', {
      type: 'plugin',
      plugin: { name: 'azure' },
    });
    const modelRandom = store.createRecord('host', {
      plugin: { name: 'random' },
    });
    assert.strictEqual(typeof modelAzure.isAzure, 'boolean');
    assert.true(modelAzure.isAzure);
    assert.false(modelRandom.isAzure);
  });

  test('get compositeType returns expected values', async function (assert) {
    const store = this.owner.lookup('service:store');
    const modelPlugin = store.createRecord('host', {
      type: 'plugin',
      plugin: { name: 'Test name' },
    });
    const modelStatic = store.createRecord('host', {
      type: 'static',
    });
    assert.strictEqual(typeof modelPlugin.compositeType, 'string');
    assert.strictEqual(modelPlugin.compositeType, 'Test name');
    assert.strictEqual(modelStatic.compositeType, 'static');
  });

  test('set compositeType sets expected values', async function (assert) {
    const store = this.owner.lookup('service:store');
    const modelPlugin = store.createRecord('host', {
      compositeType: 'aws',
    });
    const modelStatic = store.createRecord('host', {
      compositeType: 'static',
    });

    assert.strictEqual(modelPlugin.type, 'plugin');
    assert.strictEqual(modelPlugin.plugin.name, 'aws');
    assert.strictEqual(modelStatic.type, 'static');
  });
});
