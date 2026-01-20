/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Transform | object', function (hooks) {
  setupTest(hooks);

  test('it deserializes a policy object', function (assert) {
    const transform = this.owner.lookup('transform:object');
    const obj = {
      days: 365,
      overridable: true,
    };
    const expectedObj = {
      days: 365,
      overridable: true,
    };
    const emptyObj = {};
    assert.deepEqual(transform.deserialize(obj), expectedObj);
    assert.deepEqual(transform.deserialize(emptyObj), {});
  });

  test('it serializes a policy object', function (assert) {
    const transform = this.owner.lookup('transform:object');
    const obj = {
      days: 2,
      overridable: true,
    };
    const expectedObj = {
      days: 2,
      overridable: true,
    };
    const emptyObj = {};
    assert.deepEqual(transform.serialize(obj), expectedObj);
    assert.deepEqual(transform.serialize(emptyObj), {});
  });
});
