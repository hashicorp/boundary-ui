/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';

module('Unit | Route | scopes/scope/targets/index', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:scopes/scope/targets/index');
    assert.ok(route);
  });
});
