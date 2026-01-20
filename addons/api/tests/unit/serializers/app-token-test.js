/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | app-token', function (hooks) {
  setupTest(hooks);

  test('it serializes empty payload when `adapterOptions.method` is `revoke`', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('app-token');
    const record = store.createRecord('app-token', {
      name: 'App token',
      version: 1,
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = { method: 'revoke' };

    const serializedRecord = serializer.serialize(snapshot);

    assert.deepEqual(serializedRecord, {});
  });
});
