/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Transform | string array', function (hooks) {
  setupTest(hooks);

  test('it deserializes an array of strings to an array of `{value}`', function (assert) {
    const transform = this.owner.lookup('transform:string-array');
    const deserialized = transform.deserialize(['a', 'bee', 'Hello World']);
    assert.deepEqual(deserialized, [
      { value: 'a' },
      { value: 'bee' },
      { value: 'Hello World' },
    ]);
  });

  test('it deserializes null to an empty array', function (assert) {
    const transform = this.owner.lookup('transform:string-array');
    const deserialized = transform.deserialize(null);
    assert.deepEqual(deserialized, []);
  });

  test('it serializes an array of `{value}` to an array of strings', function (assert) {
    const transform = this.owner.lookup('transform:string-array');
    const serialized = transform.serialize([
      { value: 'a' },
      { value: 'bee' },
      { value: 'Hello World' },
    ]);
    assert.deepEqual(serialized, ['a', 'bee', 'Hello World']);
  });

  test('it serializes null to an empty array', function (assert) {
    const transform = this.owner.lookup('transform:string-array');
    const serialized = transform.serialize(null);
    assert.deepEqual(serialized, []);
  });
});
