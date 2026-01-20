/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | session-recording', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let serializer = store.serializerFor('session-recording');

    assert.ok(serializer);
  });

  test('it serializes records', function (assert) {
    let store = this.owner.lookup('service:store');
    let record = store.createRecord('session-recording', {});

    let serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });

  test('it serializes only version when `adapterOptions.method` is `reapply-storage-policy`', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('session-recording');
    const record = store.createRecord('session-recording', {
      version: 1,
      retain_until: 1,
      delete_after: 2,
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      method: 'reapply-storage-policy',
    };
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {});
  });

  test('it normalizes correctly', function (assert) {
    let store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('session-recording');

    let record = store.createRecord('session-recording').constructor;
    const payload = {
      id: '1',
      type: 'session-recording',
      errors: 2,
    };
    const normalized = serializer.normalize(record, payload);

    assert.deepEqual(normalized, {
      data: {
        id: '1',
        type: 'session-recording',
        attributes: {
          errors_number: 2,
          type: 'session-recording',
        },
        relationships: {},
      },
    });
  });
});
