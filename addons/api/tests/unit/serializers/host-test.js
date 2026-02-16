/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | host', function (hooks) {
  setupTest(hooks);

  test('it serializes host with type static as expected', function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('host', {
      name: 'Host 1',
      compositeType: 'static',
      description: 'Description',
      host_catalog_id: '123',
      version: 1,
      address: '188e:68a9:b342:c05c:2595:2f46:499c:759f',
    });
    assert.deepEqual(record.serialize(), {
      name: 'Host 1',
      description: 'Description',
      type: 'static',
      host_catalog_id: '123',
      version: 1,
      attributes: {
        address: '188e:68a9:b342:c05c:2595:2f46:499c:759f',
      },
    });
  });

  test('it normalizes type static record as expected', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('host');
    const host = store.createRecord('host').constructor;
    const payload = {
      id: '1',
      name: 'host test',
      type: 'static',
      authorized_actions: ['no-op', 'read'],
      address: '10.0.0.1',
    };
    const normalized = serializer.normalizeSingleResponse(store, host, payload);
    assert.deepEqual(normalized, {
      included: [],
      data: {
        id: '1',
        type: 'host',
        attributes: {
          name: 'host test',
          type: 'static',
          authorized_actions: ['no-op', 'read'],
          address: '10.0.0.1',
          dns_names: [],
          ip_addresses: [],
          host_set_ids: [],
        },
        relationships: {},
      },
    });
  });

  test('it normalizes type plugin (aws) record as expected', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('host');
    const host = store.createRecord('host').constructor;
    const payload = {
      id: '1',
      name: 'host test',
      type: 'plugin',
      plugin: {
        name: 'aws',
      },
      authorized_actions: ['no-op', 'read'],
      ip_addresses: ['10.0.0.1', '10.0.0.2', '10.0.0.3'],
      dns_names: ['test.example.internal', 'test.example.external'],
      host_set_ids: ['hst_12345'],
    };
    const normalized = serializer.normalizeSingleResponse(store, host, payload);
    assert.deepEqual(normalized, {
      included: [],
      data: {
        id: '1',
        type: 'host',
        attributes: {
          name: 'host test',
          type: 'plugin',
          authorized_actions: ['no-op', 'read'],
          ip_addresses: ['10.0.0.1', '10.0.0.2', '10.0.0.3'],
          dns_names: ['test.example.internal', 'test.example.external'],
          plugin: { name: 'aws' },
          host_set_ids: ['hst_12345'],
        },
        relationships: {},
      },
    });
  });
});
