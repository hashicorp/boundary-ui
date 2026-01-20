/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | host catalog', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('host-catalog', {});
    assert.ok(model);
  });

  test('it has isStatic property and returns the expected values', async function (assert) {
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('host-catalog', { compositeType: 'aws' });
    const modelB = store.createRecord('host-catalog', {
      compositeType: 'foobar',
    });
    const modelC = store.createRecord('host-catalog', {
      compositeType: 'static',
    });
    assert.false(modelA.isStatic);
    assert.false(modelB.isStatic);
    assert.true(modelC.isStatic);
  });

  test('it has isPlugin property and returns the expected values', async function (assert) {
    const store = this.owner.lookup('service:store');
    const modelPlugin = store.createRecord('host-catalog', {
      compositeType: 'aws',
    });
    const modelStatic = store.createRecord('host-catalog', {
      compositeType: 'static',
    });
    assert.true(modelPlugin.isPlugin);
    assert.false(modelStatic.isPlugin);
  });

  test('it has isUnknown property and returns the expected values', async function (assert) {
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('host-catalog', {
      compositeType: 'static',
    });
    const modelB = store.createRecord('host-catalog', { compositeType: 'aws' });
    const modelC = store.createRecord('host-catalog', {
      compositeType: 'no-such-type',
    });
    assert.false(modelA.isUnknown);
    assert.false(modelB.isUnknown);
    assert.true(modelC.isUnknown);
  });

  test('it has isAWS property and returns the expected values', async function (assert) {
    const store = this.owner.lookup('service:store');
    const modelAws = store.createRecord('host-catalog', {
      type: 'plugin',
      plugin: { name: 'aws' },
    });
    const modelRandom = store.createRecord('host-catalog', {
      plugin: { name: 'random' },
    });
    assert.true(modelAws.isAWS);
    assert.false(modelRandom.isAWS);
  });

  test('it has isAzure property and return the expected values', async function (assert) {
    const store = this.owner.lookup('service:store');
    const modelAzure = store.createRecord('host-catalog', {
      type: 'plugin',
      plugin: { name: 'azure' },
    });
    const modelRandom = store.createRecord('host-catalog', {
      plugin: { name: 'random' },
    });
    assert.true(modelAzure.isAzure);
    assert.false(modelRandom.isAzure);
  });

  test('it has isGCP property and return the expected values', async function (assert) {
    const store = this.owner.lookup('service:store');
    const modelGCP = store.createRecord('host-catalog', {
      type: 'plugin',
      plugin: { name: 'gcp' },
    });
    const modelRandom = store.createRecord('host-catalog', {
      plugin: { name: 'random' },
    });
    assert.true(modelGCP.isGCP);
    assert.false(modelRandom.isGCP);
  });

  test('get compositeType returns expected values', async function (assert) {
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('host-catalog', {
      type: 'static',
    });
    const modelB = store.createRecord('host-catalog', {
      type: 'plugin',
      plugin: { name: 'aws' },
    });
    const modelC = store.createRecord('host-catalog', {
      type: 'plugin',
      plugin: { name: 'no-such-type' },
    });
    const modelD = store.createRecord('host-catalog', {
      type: 'plugin',
      plugin: { name: 'gcp' },
    });
    assert.strictEqual(modelA.compositeType, 'static');
    assert.strictEqual(modelB.compositeType, 'aws');
    assert.strictEqual(modelD.compositeType, 'gcp');
    assert.strictEqual(modelC.compositeType, 'unknown');
  });

  test('set compositeType sets expected values', async function (assert) {
    const store = this.owner.lookup('service:store');
    const modelPlugin = store.createRecord('host-catalog', {
      compositeType: 'aws',
    });
    const modelStatic = store.createRecord('host-catalog', {
      compositeType: 'static',
    });
    const modelGCP = store.createRecord('host-catalog', {
      compositeType: 'gcp',
    });
    assert.strictEqual(modelPlugin.type, 'plugin');
    assert.strictEqual(modelPlugin.plugin.name, 'aws');
    assert.strictEqual(modelStatic.type, 'static');
    assert.strictEqual(modelGCP.plugin.name, 'gcp');
  });
});
