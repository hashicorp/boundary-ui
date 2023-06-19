/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3 } from 'api/models/storage-bucket';

module('Unit | Model | storage bucket', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('storage-bucket', {});
    assert.ok(model);
  });

  test('it has the isPlugin property and returns the expected values', async function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const modelPlugin = store.createRecord('storage-bucket', {
      type: 'plugin',
      plugin: {
        name: TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3,
      },
    });
    assert.true(modelPlugin.isPlugin);
  });

  test('it has isUnknown property and returns the expected values', async function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('storage-bucket', {
      compositeType: TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3,
    });
    const modelB = store.createRecord('storage-bucket', {
      compositeType: 'no-such-type',
    });
    assert.false(modelA.isUnknown);
    assert.true(modelB.isUnknown);
  });

  test('it has isAWS property and returns the expected values', async function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const modelAws = store.createRecord('storage-bucket', {
      type: 'plugin',
      plugin: { name: TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3 },
    });
    const modelRandom = store.createRecord('storage-bucket', {
      plugin: { name: 'random' },
    });
    assert.true(modelAws.isAWS);
    assert.false(modelRandom.isAWS);
  });

  test('get compositeType returns expected values', async function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('storage-bucket', {
      type: 'plugin',
      plugin: { name: TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3 },
    });
    const modelB = store.createRecord('storage-bucket', {
      type: 'plugin',
      plugin: { name: 'no-such-type' },
    });
    assert.strictEqual(modelA.compositeType, TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3);
    assert.strictEqual(modelB.compositeType, 'unknown');
  });

  test('set compositeType sets expected values', async function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const modelPlugin = store.createRecord('storage-bucket', {
      compositeType: TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3,
    });
    assert.strictEqual(modelPlugin.type, 'plugin');
    assert.strictEqual(
      modelPlugin.plugin.name,
      TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3
    );
  });
});
