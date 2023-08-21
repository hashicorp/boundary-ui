/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'desktop/tests/helpers';

module(
  'Unit | Controller | scopes/scope/projects/sessions/session',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      assert.expect(1);
      let controller = this.owner.lookup(
        'controller:scopes/scope/projects/sessions/session'
      );

      assert.ok(controller);
    });

    test('isRawApiVisible default value is false', function (assert) {
      assert.expect(1);
      let controller = this.owner.lookup(
        'controller:scopes/scope/projects/sessions/session'
      );

      assert.false(controller.isRawApiVisible);
    });

    test('isRawApiVisible toggles when called', function (assert) {
      assert.expect(2);
      let controller = this.owner.lookup(
        'controller:scopes/scope/projects/sessions/session'
      );

      assert.false(controller.isRawApiVisible);

      controller.send('toggleCredentials');

      assert.true(controller.isRawApiVisible);
    });
  }
);
