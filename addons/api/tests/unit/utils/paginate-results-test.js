/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { paginateResults } from 'api/utils/paginate-results';
import { module, test } from 'qunit';

module('Unit | Utility | paginate-results', function () {
  test('it returns the full array when no page or pageSize is given', function (assert) {
    const array = ['a', 'b', 'c'];
    assert.deepEqual(paginateResults(array, undefined, undefined), array);
  });

  test('it returns an empty array when given an empty array', function (assert) {
    assert.deepEqual(paginateResults([], 1, 10), []);
  });

  test('it returns all items on the first page when they all fit within pageSize', function (assert) {
    const array = ['a', 'b', 'c', 'd', 'e'];
    assert.deepEqual(paginateResults(array, 1, 10), array);
    assert.deepEqual(paginateResults(array, 1, 50), array);
  });

  test('it returns the correct slice for a page in the middle of the results', function (assert) {
    const array = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    assert.deepEqual(paginateResults(array, 2, 3), ['d', 'e', 'f']);
  });

  test('it returns an empty array, not a duplicate of the last item, for a page beyond the available results', function (assert) {
    const array = ['a', 'b', 'c', 'd', 'e'];

    // With only 5 items and a pageSize of 10, there is only one page of
    // results. Requesting page 2 or beyond must not return any items.
    assert.deepEqual(paginateResults(array, 2, 10), []);
    assert.deepEqual(paginateResults(array, 3, 10), []);
  });
});
