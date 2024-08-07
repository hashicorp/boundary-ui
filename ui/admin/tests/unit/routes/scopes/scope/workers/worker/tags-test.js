/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';

module('Unit | Route | scopes/scope/workers/worker/tags', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:scopes/scope/workers/worker/tags');
    assert.ok(route);
  });
});
