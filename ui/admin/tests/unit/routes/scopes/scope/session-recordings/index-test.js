/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';

module(
  'Unit | Route | scopes/scope/session-recordings/index',
  function (hooks) {
    setupTest(hooks);
    setupIntl(hooks, 'en-us');

    test('it exists', function (assert) {
      let route = this.owner.lookup(
        'route:scopes/scope/session-recordings/index',
      );
      assert.ok(route);
    });
  },
);
