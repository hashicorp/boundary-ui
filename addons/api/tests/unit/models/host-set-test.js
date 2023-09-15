/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import {
  TYPE_HOST_CATALOG_STATIC,
  TYPE_HOST_CATALOG_PLUGIN,
  TYPE_PLUGIN_AWS,
  TYPE_PLUGIN_AZURE,
} from 'api/models/host-catalog';

module('Unit | Model | host set', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it has an `addHosts` method that targets a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post('/v1/host-sets/123abc:add-hosts', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        host_ids: ['123_abc', 'foobar'],
        version: 1,
      });
      return { id: '123abc' };
    });
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'host-set',
        attributes: {
          name: 'Host Set',
          description: 'Description',
          host_ids: ['1', '2'],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('host-set', '123abc');
    await model.addHosts(['123_abc', 'foobar']);
  });

  test('it has an `addHost` method that adds a single host using `addHosts` method', async function (assert) {
    assert.expect(1);
    this.server.post('/v1/host-sets/123abc:add-hosts', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        host_ids: ['foobar'],
        version: 1,
      });
      return { id: '123abc' };
    });
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'host-set',
        attributes: {
          name: 'Host Set',
          description: 'Description',
          host_ids: ['1', '3'],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('host-set', '123abc');
    await model.addHost('foobar');
  });

  test('it has a `removeHosts` method that targets a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post('/v1/host-sets/123abc:remove-hosts', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        host_ids: ['3'],
        version: 1,
      });
      return { id: '123abc' };
    });
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'host-set',
        attributes: {
          name: 'Host Set',
          description: 'Description',
          host_ids: ['1', '3'],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('host-set', '123abc');
    await model.removeHosts(['3']);
  });

  test('it has a `removeHost` method that removes a single host using `removeHosts` method', async function (assert) {
    assert.expect(1);
    this.server.post('/v1/host-sets/123abc:remove-hosts', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        host_ids: ['3'],
        version: 1,
      });
      return { id: '123abc' };
    });
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'host-set',
        attributes: {
          name: 'Host Set',
          description: 'Description',
          host_ids: ['1', '3'],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('host-set', '123abc');
    await model.removeHost('3');
  });

  test('it has isStatic and returns the expected values', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('host-set', {
      type: TYPE_HOST_CATALOG_STATIC,
    });
    const modelB = store.createRecord('host-set', {
      type: TYPE_HOST_CATALOG_PLUGIN,
    });
    assert.strictEqual(typeof modelA.isStatic, 'boolean');
    assert.true(modelA.isStatic);
    assert.false(modelB.isStatic);
  });

  test('it has isPlugin and returns the expected values', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const modelPlugin = store.createRecord('host-set', {
      type: TYPE_HOST_CATALOG_PLUGIN,
    });
    const modelStatic = store.createRecord('host-set', {
      type: TYPE_HOST_CATALOG_STATIC,
    });
    assert.strictEqual(typeof modelPlugin.isPlugin, 'boolean');
    assert.true(modelPlugin.isPlugin);
    assert.false(modelStatic.isPlugin);
  });

  test('it has isAws and return the expected values', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const modelAws = store.createRecord('host-set', {
      type: TYPE_HOST_CATALOG_PLUGIN,
      plugin: { name: TYPE_PLUGIN_AWS },
    });
    const modelRandom = store.createRecord('host-set', {
      plugin: { name: 'random' },
    });
    assert.strictEqual(typeof modelAws.isAWS, 'boolean');
    assert.true(modelAws.isAWS);
    assert.false(modelRandom.isAWS);
  });

  test('it has isAzure and return the expected values', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const modelAzure = store.createRecord('host-set', {
      type: TYPE_HOST_CATALOG_PLUGIN,
      plugin: { name: TYPE_PLUGIN_AZURE },
    });
    const modelRandom = store.createRecord('host-set', {
      plugin: { name: 'random' },
    });
    assert.strictEqual(typeof modelAzure.isAzure, 'boolean');
    assert.true(modelAzure.isAzure);
    assert.false(modelRandom.isAzure);
  });

  test('get compositeType return expected values', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const modelPlugin1 = store.createRecord('host-set', {
      type: TYPE_HOST_CATALOG_PLUGIN,
      plugin: { name: TYPE_PLUGIN_AWS },
    });
    const modelPlugin2 = store.createRecord('host-set', {
      type: TYPE_HOST_CATALOG_PLUGIN,
      plugin: { name: 'Test name' },
    });
    const modelStatic = store.createRecord('host-set', {
      type: TYPE_HOST_CATALOG_STATIC,
    });
    assert.strictEqual(modelPlugin1.compositeType, TYPE_PLUGIN_AWS);
    assert.strictEqual(modelPlugin2.compositeType, 'unknown');
    assert.strictEqual(modelStatic.compositeType, TYPE_HOST_CATALOG_STATIC);
  });

  test('set compositeType sets expected values', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const modelPlugin = store.createRecord('host-set', {
      compositeType: TYPE_PLUGIN_AWS,
    });
    const modelStatic = store.createRecord('host-set', {
      compositeType: TYPE_HOST_CATALOG_STATIC,
    });

    assert.strictEqual(modelPlugin.type, TYPE_HOST_CATALOG_PLUGIN);
    assert.strictEqual(modelPlugin.plugin.name, TYPE_PLUGIN_AWS);
    assert.strictEqual(modelStatic.type, TYPE_HOST_CATALOG_STATIC);
  });
});
