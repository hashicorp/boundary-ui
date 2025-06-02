/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import sortNameWithIdFallback from 'admin/utils/sort-name-with-id-fallback';
import { module, test } from 'qunit';

module('Unit | Utility | sort-name-with-id-fallback', function () {
  // TODO: Replace this with your real tests.
  test('it works', function (assert) {
    let result = sortNameWithIdFallback();
    assert.ok(result);
  });
});
