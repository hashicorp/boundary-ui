/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Route | scopes/scope/host-catalogs/host-catalog/host-sets/host-set/create-and-add-host',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let route = this.owner.lookup(
        'route:scopes/scope/host-catalogs/host-catalog/host-sets/host-set/create-and-add-host',
      );
      assert.ok(route);
    });
  },
);
