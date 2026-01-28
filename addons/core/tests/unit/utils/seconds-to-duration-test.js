/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { secondsToDuration } from 'core/utils/seconds-to-duration';
import { module, test } from 'qunit';

module('Unit | Utility | seconds-to-duration', function () {
  test('it handles 0 correctly', function (assert) {
    const result = secondsToDuration(0);

    assert.strictEqual(result.seconds, 0);
    assert.strictEqual(result.minutes, 0);
    assert.strictEqual(result.hours, 0);
    assert.strictEqual(result.days, 0);
    assert.strictEqual(result.weeks, 0);
  });

  test('it converts seconds correctly', function (assert) {
    const result = secondsToDuration(45);

    assert.strictEqual(result.seconds, 45);
    assert.strictEqual(result.minutes, 0);
    assert.strictEqual(result.hours, 0);
    assert.strictEqual(result.days, 0);
    assert.strictEqual(result.weeks, 0);
  });

  test('it converts minutes correctly', function (assert) {
    const result = secondsToDuration(100);

    assert.strictEqual(result.seconds, 40);
    assert.strictEqual(result.minutes, 1);
    assert.strictEqual(result.hours, 0);
    assert.strictEqual(result.days, 0);
    assert.strictEqual(result.weeks, 0);
  });

  test('it converts hours correctly', function (assert) {
    const result = secondsToDuration(5000);

    assert.strictEqual(result.seconds, 20);
    assert.strictEqual(result.minutes, 23);
    assert.strictEqual(result.hours, 1);
    assert.strictEqual(result.days, 0);
    assert.strictEqual(result.weeks, 0);
  });

  test('it converts days correctly', function (assert) {
    const result = secondsToDuration(500000);

    assert.strictEqual(result.seconds, 20);
    assert.strictEqual(result.minutes, 53);
    assert.strictEqual(result.hours, 18);
    assert.strictEqual(result.days, 5);
    assert.strictEqual(result.weeks, 0);
  });

  test('it converts weeks correctly', function (assert) {
    const result = secondsToDuration(800000);

    assert.strictEqual(result.seconds, 20);
    assert.strictEqual(result.minutes, 13);
    assert.strictEqual(result.hours, 6);
    assert.strictEqual(result.days, 2);
    assert.strictEqual(result.weeks, 1);
  });

  test('it handles negative values', function (assert) {
    const result = secondsToDuration(-800000);

    assert.strictEqual(result.seconds, 0);
    assert.strictEqual(result.minutes, 0);
    assert.strictEqual(result.hours, 0);
    assert.strictEqual(result.days, 0);
    assert.strictEqual(result.weeks, 0);
  });
});
