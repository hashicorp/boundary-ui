/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { flattenObject } from 'api/utils/flatten-nested-object';
import { module, test } from 'qunit';

module('Unit | Utility | flatten-nested-object', function () {
  test('it flattens a nested object to single level object', function (assert) {
    const input = {
      a: 1,
      b: { c: 2, d: 3 },
    };
    const expected = {
      a: 1,
      'b.c': 2,
      'b.d': 3,
    };
    assert.deepEqual(flattenObject(input), expected);
  });

  test('removes keys with null/empty values', function (assert) {
    const inputOne = {
      a: null,
      b: { c: 2 },
    };
    const inputTwo = {
      d: { e: null },
    };
    const expectedResultOne = {
      'b.c': 2,
    };
    const expectedResultTwo = {};

    assert.deepEqual(flattenObject(inputOne), expectedResultOne);
    assert.deepEqual(flattenObject(inputTwo), expectedResultTwo);
  });
});
