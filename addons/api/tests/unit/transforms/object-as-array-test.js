/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Transform | object as array', function (hooks) {
  setupTest(hooks);

  test('it deserializes an object to an array of key value objects', function (assert) {
    let transform = this.owner.lookup('transform:object-as-array');
    const deserialized = transform.deserialize({
      first: 'Hey',
      second: 'There',
      third: 'Everyone',
    });
    assert.deepEqual(deserialized, [
      { key: 'first', value: 'Hey' },
      { key: 'second', value: 'There' },
      { key: 'third', value: 'Everyone' },
    ]);
  });

  test('it deserializes undefined to an empty object', function (assert) {
    let transform = this.owner.lookup('transform:object-as-array');
    const deserialized = transform.deserialize(undefined);
    assert.deepEqual(deserialized, []);
  });

  test('it serializes an array of key value objects to an object', function (assert) {
    let transform = this.owner.lookup('transform:object-as-array');
    const serialized = transform.serialize([
      { key: 'first', value: 'Hey' },
      { key: 'second', value: 'There' },
      { key: 'third', value: 'Everyone' },
    ]);

    assert.deepEqual(serialized, {
      first: 'Hey',
      second: 'There',
      third: 'Everyone',
    });
  });

  test('it serializes an empty array of key value objects to null', function (assert) {
    let transform = this.owner.lookup('transform:object-as-array');
    const serialized = transform.serialize([]);

    assert.deepEqual(serialized, null);
  });
});
