/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Transform | array', function (hooks) {
  setupTest(hooks);

  test('it serializes a principals array', function (assert) {
    const transform = this.owner.lookup('transform:array');
    const principal = [
      { id: 2, type: 'user' },
      { id: 3, type: 'group' },
      { id: 3, type: 'managed-group' },
    ];
    const expectedArr = [
      { id: 2, type: 'user' },
      { id: 3, type: 'group' },
      { id: 3, type: 'managed-group' },
    ];
    const emptyArr = [];
    assert.deepEqual(transform.serialize(principal), expectedArr);
    assert.deepEqual(transform.serialize(emptyArr), []);
  });

  test('it deserializes a principals array', function (assert) {
    const transform = this.owner.lookup('transform:array');
    const principal = [
      { id: 2, type: 'user' },
      { id: 3, type: 'group' },
      { id: 3, type: 'managed-group' },
    ];
    const expectedArr = [
      { id: 2, type: 'user' },
      { id: 3, type: 'group' },
      { id: 3, type: 'managed-group' },
    ];
    const emptyArr = [];
    assert.deepEqual(transform.deserialize(principal), expectedArr);
    assert.deepEqual(transform.deserialize(emptyArr), []);
  });
});
