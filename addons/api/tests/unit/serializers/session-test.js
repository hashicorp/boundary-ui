/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | session', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let serializer = store.serializerFor('session');

    assert.ok(serializer);
  });

  test('it serializes only version when `adapterOptions.method` is `cancel`', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('session');
    const record = store.createRecord('session', {
      version: 1,
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      method: 'cancel',
    };
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      version: 1,
    });
  });
});
