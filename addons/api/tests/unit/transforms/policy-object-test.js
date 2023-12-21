/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Transform | policy object', function (hooks) {
  setupTest(hooks);

  test('it deserializes a policy object', function (assert) {
    const transform = this.owner.lookup('transform:policy-object');
    const obj = {
      days: 365,
      overridable: true,
    };
    const expectedObj = {
      days: 1,
      overridable: true,
    };

    assert.deepEqual(transform.deserialize(obj), expectedObj);
  });

  test('it serializes a policy object', function (assert) {
    const transform = this.owner.lookup('transform:policy-object');
    const obj = {
      days: 2,
      overridable: true,
    };
    const expectedObj = {
      days: 730,
      overridable: true,
    };
    assert.deepEqual(transform.serialize(obj), expectedObj);
  });
});
