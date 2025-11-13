/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';

module('Unit | Route | scopes/scope/app-tokens', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:scopes/scope/app-tokens');
    assert.ok(route);
  });
});
