/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'desktop/tests/helpers';

module('Unit | Controller | scopes/scope/projects/error', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let controller = this.owner.lookup(
      'controller:scopes/scope/projects/error',
    );
    assert.ok(controller);
    assert.ok(controller.appUtilities);
  });
});
