/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import grantParser from 'admin/utils/grant-parser';
import { module, test } from 'qunit';

module('Unit | Utility | grant-parser', function () {
  // TODO: Replace this with your real tests.
  test('it works', function (assert) {
    let result = grantParser();
    assert.ok(result);
  });
});
