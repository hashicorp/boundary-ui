/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'desktop/tests/helpers';

module(
  'Unit | Controller | scopes/scope/projects/targets/target',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let controller = this.owner.lookup(
        'controller:scopes/scope/projects/targets/target',
      );
      assert.ok(controller);
    });
  },
);
