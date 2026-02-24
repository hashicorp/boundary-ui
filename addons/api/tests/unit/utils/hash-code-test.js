/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { hashCode } from 'api/utils/hash-code';
import { module, test } from 'qunit';

module('Unit | Utility | hash-code', function () {
  test('it hashes', function (assert) {
    const result = hashCode({ a: 1, b: 2 });
    assert.ok(result);
  });

  test('it hashes to same result regardless of object order', function (assert) {
    const first = hashCode({ a: 1, b: 2, c: 3 });
    const second = hashCode({ b: 2, c: 3, a: 1 });
    assert.strictEqual(first, second);
  });

  test('it hashes to different result if objects are different', function (assert) {
    const first = hashCode({ a: 1, b: 2, c: 3 });
    const second = hashCode({ a: '1', b: '2', c: '3' });
    assert.notStrictEqual(first, second);
  });

  test('it hashes an empty object', function (assert) {
    const result = hashCode({});
    assert.ok(result);
  });

  test('it hashes null to 0', function (assert) {
    const result = hashCode(null);
    assert.strictEqual(result, 0);
  });

  test('it hashes undefined to 0', function (assert) {
    const result = hashCode(undefined);
    assert.strictEqual(result, 0);
  });
});
