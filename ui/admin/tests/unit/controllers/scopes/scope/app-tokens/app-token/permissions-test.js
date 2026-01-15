/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Controller | scopes/scope/app-tokens/app-token/permissions',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let controller = this.owner.lookup(
        'controller:scopes/scope/app-tokens/app-token/permissions',
      );
      assert.ok(controller);
    });
  },
);
