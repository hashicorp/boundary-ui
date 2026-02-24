/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Controller | scopes/scope/credential-stores/credential-store/edit-worker-filter',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let controller = this.owner.lookup(
        'controller:scopes/scope/credential-stores/credential-store/edit-worker-filter',
      );
      assert.ok(controller);
      assert.ok(controller.credentialStores);
    });
  },
);
