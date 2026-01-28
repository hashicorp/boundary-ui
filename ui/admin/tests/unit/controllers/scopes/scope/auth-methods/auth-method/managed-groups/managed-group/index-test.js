/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Controller | scopes/scope/auth-methods/auth-method/managed-groups/managed-group/index',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let controller = this.owner.lookup(
        'controller:scopes/scope/auth-methods/auth-method/managed-groups/managed-group/index',
      );
      assert.ok(controller);
      assert.ok(controller.authMethods);
      assert.ok(controller.managedGroups);
    });
  },
);
