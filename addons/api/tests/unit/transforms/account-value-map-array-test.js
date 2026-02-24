/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Transform | account value map array', function (hooks) {
  setupTest(hooks);

  test('it deserializes an array of account claims', function (assert) {
    const transform = this.owner.lookup('transform:account-value-map-array');
    const deserialized = transform.deserialize(['oid=sub', 'full_name=name']);
    assert.deepEqual(deserialized, [
      { key: 'oid', value: 'sub' },
      { key: 'full_name', value: 'name' },
    ]);
  });

  test('it serializes an array of account claims', function (assert) {
    const transform = this.owner.lookup('transform:account-value-map-array');
    const serialized = transform.serialize([
      { key: 'oid', value: 'sub' },
      { key: 'full_name', value: 'name' },
    ]);
    assert.deepEqual(serialized, ['oid=sub', 'full_name=name']);
  });
});
