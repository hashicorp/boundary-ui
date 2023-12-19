/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | storage policy', function (hooks) {
  setupTest(hooks);

  test('it serializes records', function (assert) {
    let store = this.owner.lookup('service:store');
    let record = store.createRecord('storage-policy', {});

    let serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });

  test('it serializes a new storage policy as expected', async function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('storage-policy', {
      name: 'policy',
      description: 'this is a policy',
      scope_id: 'global',
      type: 'storage',
      retain_for: {
        days: 500,
        overridable: true,
      },
      delete_after: {
        days: 100,
        overridable: true,
      },
    });
    const expectedResult = {
      name: 'policy',
      description: 'this is a policy',
      type: 'storage',
      scope_id: 'global',
      attributes: {
        retain_for: {
          days: 500,
          overridable: true,
        },
        delete_after: {
          days: 100,
          overridable: true,
        },
      },
    };
    assert.deepEqual(record.serialize(), expectedResult);
  });

  test('it serializes when updating a storage policy correctly', async function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('storage-policy');
    store.push({
      data: {
        id: '1',
        type: 'storage-policy',
        attributes: {
          name: 'AWS',
          description: 'desc',
          type: 'storage',
          scope_id: 'global',
          version: 1,
          retain_for: {
            days: 500,
            overridable: true,
          },
          delete_after: {
            days: 100,
            overridable: true,
          },
        },
      },
    });
    const record = store.peekRecord('storage-policy', '1');

    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);

    const expectedResult = {
      name: 'AWS',
      description: 'desc',
      type: 'storage',
      scope_id: 'global',
      attributes: {
        retain_for: {
          days: 500,
          overridable: true,
        },
        delete_after: {
          days: 100,
          overridable: true,
        },
      },
      version: 1,
    };
    assert.deepEqual(serializedRecord, expectedResult);
  });

  test('it normalizes correctly', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('storage-policy');
    const modalClass = store.createRecord('storage-policy').constructor;
    const payload = {
      id: '1',
      version: 1,
      name: 'policy',
      description: 'policy desc',
      type: 'storage',

      attributes: {
        retain_for: {
          days: 500,
          overridable: true,
        },
        delete_after: {
          days: 100,
          overridable: true,
        },
      },
    };
    const normalized = serializer.normalizeSingleResponse(
      store,
      modalClass,
      payload,
    );

    assert.deepEqual(normalized, {
      included: [],
      data: {
        id: '1',
        attributes: {
          name: 'policy',
          description: 'policy desc',
          type: 'storage',
          version: 1,
          authorized_actions: [],
          retain_for: {
            days: 500,
            overridable: true,
          },
          delete_after: {
            days: 100,
            overridable: true,
          },
        },
        type: 'storage-policy',
        relationships: {},
      },
    });
  });
});
