/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-mirage/test-support';
import { TYPE_WORKER_PKI } from 'api/models/worker';

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
      type: TYPE_WORKER_PKI,
      scope: {
        scope_id: scopeId,
        type: 'global',
      },
    });

    await model.createWorkerLed(workerGeneratedAuthToken);
    const worker = store.peekRecord('worker', '123abc');

    assert.ok(worker);
  });

  test('it has `setApiTags` method that targets a specific POST API', async function (assert) {
    assert.expect(1);
    const workerId = 'w_123';
    const tags = {
      tag1: ['value1', 'value2'],
      tag2: ['value3'],
    };
    this.server.post(
      `/workers/${workerId}:set-worker-tags`,
      (schema, request) => {
        const body = JSON.parse(request.requestBody);
        assert.deepEqual(body, { api_tags: tags, version: 1 });
        return { id: workerId };
      },
    );

    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: workerId,
        type: 'worker',
        attributes: {
          name: 'fake worker',
          version: 1,
        },
      },
    });

    const model = store.peekRecord('worker', workerId);
    await model.setApiTags(tags);
  });

  test('it has a `removeApiTags` method that targets a specific POST API', async function (assert) {
    assert.expect(1);
    const workerId = 'w_123';
    const tags = {
      tag1: ['value1'],
    };
    this.server.post(
      `/workers/${workerId}:remove-worker-tags`,
      (schema, request) => {
        const body = JSON.parse(request.requestBody);
        assert.deepEqual(body, { api_tags: tags, version: 1 });
        return { id: workerId };
      },
    );

    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: workerId,
        type: 'worker',
        attributes: {
          name: 'fake worker',
          version: 1,
          api_tags: tags,
        },
      },
    });
    const model = store.peekRecord('worker', workerId);

    await model.removeApiTags(tags);
  });

  test('it has a `configTagList` method that returns an array of key/value pair objects', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('worker', {
      config_tags: {
        tag1: ['value1', 'value2'],
        tag2: ['value3'],
      },
    });
    const expected = [
      { key: 'tag1', value: 'value1', type: 'config' },
      { key: 'tag1', value: 'value2', type: 'config' },
      { key: 'tag2', value: 'value3', type: 'config' },
    ];

    assert.deepEqual(model.configTagList, expected);
  });

  test('it has a `configTagList` method that returns null if there are no config tags', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('worker');

    assert.deepEqual(model.configTagList, null);
  });

  test('it has a `apiTagList` method that returns an array of key/value pair objects', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('worker', {
      api_tags: {
        tag1: ['value1', 'value2'],
        tag2: ['value3'],
      },
    });
    const expected = [
      { key: 'tag1', value: 'value1', type: 'api' },
      { key: 'tag1', value: 'value2', type: 'api' },
      { key: 'tag2', value: 'value3', type: 'api' },
    ];

    assert.deepEqual(model.apiTagList, expected);
  });

  test('it has a `apiTagList` method that returns null if there are no api tags', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('worker');

    assert.deepEqual(model.apiTagList, null);
  });

  test('it has a `allTags` method that returns an array of key/value pair objects with tag type', function (assert) {
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

    assert.deepEqual(model.allTags, expected);
  });

  test('it has a `allTags` method that returns an empty array if there are no config or api tags', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('worker');

    assert.deepEqual(model.allTags, []);
  });

  test('tagCount returns the total number of tags', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('worker', {
      config_tags: {
        tag1: ['value1', 'value2'],
        tag2: ['value3'],
      },
      api_tags: {
        tag2: ['value3'],
      },
    });

    assert.strictEqual(model.tagCount, 4);
  });

  test('tagCount returns 0 if there are no tags', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('worker');

    assert.strictEqual(model.tagCount, 0);
  });
});
