/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Transform | duration', function (hooks) {
  setupTest(hooks);

  test('it deserializes a duration string', function (assert) {
    const transform = this.owner.lookup('transform:duration');

    const num1 = transform.deserialize('0s');
    const num2 = transform.deserialize(undefined);
    const num3 = transform.deserialize('3s');
    const num4 = transform.deserialize('15.003s');
    const num5 = transform.deserialize('15.0035s');
    const num6 = transform.deserialize('15.0034s');
    const num7 = transform.deserialize('3.000000001s');
    const num8 = transform.deserialize('300000000001s');

    assert.strictEqual(num1, 0);
    assert.strictEqual(num2, 0);
    assert.strictEqual(num3, 3000);
    assert.strictEqual(num4, 15003);
    assert.strictEqual(num5, 15004);
    assert.strictEqual(num6, 15003);
    assert.strictEqual(num7, 3000);
    assert.strictEqual(num8, 300000000001000);
  });

  test('it serializes a duration number', function (assert) {
    const transform = this.owner.lookup('transform:duration');
    const num1 = transform.serialize(0);
    const num2 = transform.serialize(undefined);
    const num3 = transform.serialize(3000);
    const num4 = transform.serialize(15003);
    const num5 = transform.serialize(15000000000001);
    const num6 = transform.serialize(0.000001);
    const num7 = transform.serialize(0.0000001);

    assert.strictEqual(num1, '0s');
    assert.strictEqual(num2, '0s');
    assert.strictEqual(num3, '3s');
    assert.strictEqual(num4, '15.003s');
    assert.strictEqual(num5, '15000000000.001s');
    assert.strictEqual(num6, '0.000000001s');
    assert.strictEqual(num7, '0s');
  });
});
