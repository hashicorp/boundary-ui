/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import {
  GRANT_FIELDS,
  TEMPLATE_RESOURCE_TYPES,
  normalizeGrantsSchema,
  parseGrantLine,
  getValidActions,
  getValidOutputFields,
} from 'admin/utils/grant-parser';
import { module, test } from 'qunit';

module('Unit | Utility | grant-parser', function () {
  test('it exports named grant parser utilities', function (assert) {
    assert.ok(GRANT_FIELDS);
    assert.ok(TEMPLATE_RESOURCE_TYPES);
    assert.ok(normalizeGrantsSchema);
    assert.ok(parseGrantLine);
    assert.ok(getValidActions);
    assert.ok(getValidOutputFields);
  });
});
