/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { paramValueFinder } from 'admin/utils/param-value-finder';

module('Unit | Utility | param-value-finder', function (hooks) {
  setupTest(hooks);

  let router;

  hooks.beforeEach(function () {
    router = this.owner.lookup('service:router');
  });

  test('returns empty array when null or empty routeInfo object is used', function (assert) {
    let result = paramValueFinder('scopes', null);

    assert.deepEqual(result, []);

    result = paramValueFinder('scopes', {});

    assert.deepEqual(result, []);
  });

  test('returns correct array when routeInfo object is used', function (assert) {
    let routeInfo = router.recognize('/scopes');
    let result = paramValueFinder('scopes', routeInfo.parent);

    assert.deepEqual(result, []);

    routeInfo = router.recognize('/scopes/global/auth-methods');
    result = paramValueFinder('scopes', routeInfo.parent);
    assert.deepEqual(result, ['global']);
  });
});
