/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Model | worker', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it has a `createWorkerLed` method that targets a specific POST API', async function (assert) {
    assert.expect(2);
    const scopeId = 'global';
    const workerGeneratedAuthToken = 'token';
    this.server.post('/workers:create:worker-led', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        scope_id: scopeId,
        worker_generated_auth_token: workerGeneratedAuthToken,
      });
      return { id: '123abc' };
    });

    const store = this.owner.lookup('service:store');
    const model = store.createRecord('worker', {
      type: 'pki',
      scope: {
        scope_id: scopeId,
        type: 'global',
      },
    });

    await model.createWorkerLed(workerGeneratedAuthToken);
    const worker = store.peekRecord('worker', '123abc');

    assert.ok(worker);
  });

  test('it has a `getConfigTagList` method that returns an array of key/value pair objects', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('worker', {
      config_tags: {
        tag1: ['value1', 'value2'],
        tag2: ['value3'],
      },
    });
    const expected = [
      { key: 'tag1', value: 'value1' },
      { key: 'tag1', value: 'value2' },
      { key: 'tag2', value: 'value3' },
    ];

    assert.deepEqual(model.getConfigTagList(), expected);
  });

  test('it has a `getConfigTagList` method that returns null if there are no config tags', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('worker');

    assert.deepEqual(model.getConfigTagList(), null);
  });

  test('it has a `getApiTagList` method that returns an array of key/value pair objects', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('worker', {
      api_tags: {
        tag1: ['value1', 'value2'],
        tag2: ['value3'],
      },
    });
    const expected = [
      { key: 'tag1', value: 'value1' },
      { key: 'tag1', value: 'value2' },
      { key: 'tag2', value: 'value3' },
    ];

    assert.deepEqual(model.getApiTagList(), expected);
  });

  test('it has a `getApiTagList` method that returns null if there are no api tags', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('worker');

    assert.deepEqual(model.getApiTagList(), null);
  });

  test('it has a `getAllTags` method that returns an array of key/value pair objects with tag type', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('worker', {
      config_tags: {
        tag1: ['value1', 'value2'],
        tag2: ['value3'],
      },
      api_tags: {
        tag1: ['value1', 'value2'],
        tag2: ['value3'],
      },
    });
    const expected = [
      { key: 'tag1', value: 'value1', type: 'config' },
      { key: 'tag1', value: 'value2', type: 'config' },
      { key: 'tag2', value: 'value3', type: 'config' },
      { key: 'tag1', value: 'value1', type: 'api' },
      { key: 'tag1', value: 'value2', type: 'api' },
      { key: 'tag2', value: 'value3', type: 'api' },
    ];

    assert.deepEqual(model.getAllTags(), expected);
  });

  test('it has a `getAllTags` method that returns an empty array if there are no config or api tags', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('worker');

    assert.deepEqual(model.getAllTags(), []);
  });

  test('tagCount returns the total number of tags', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('worker', {
      canonical_tags: {
        tag1: ['value1', 'value2'],
        tag2: ['value3'],
      },
    });

    assert.strictEqual(model.tagCount, 3);
  });

  test('tagCount returns 0 if there are no tags', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('worker');

    assert.strictEqual(model.tagCount, 0);
  });
});
