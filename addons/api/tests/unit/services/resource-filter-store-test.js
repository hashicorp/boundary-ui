/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { ResourceFilter } from 'api/services/resource-filter-store';

module('Unit | Service | resource-filter-store', function (hooks) {
  setupTest(hooks);

  test('it exports a ResourceFilter class that converts filterObjects to query expressions', function (assert) {
    assert.ok(ResourceFilter);
    const filter = new ResourceFilter({
      type: 'oidc',
      status: ['active', 'pending'],
      authorized_actions: [{ contains: 'read' }],
    });
    const expected =
      '("/item/type" == "oidc") and ("/item/status" == "active" or "/item/status" == "pending") and ("read" in "/item/authorized_actions")';
    assert.strictEqual(filter.queryExpression, expected);
  });
});
