/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitUntil } from '@ember/test-helpers';

module('Unit | Controller | scopes/scope/roles/index', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:scopes/scope/roles/index');
    assert.ok(controller);
  });

  test('handleSearchInput action sets expected values correctly', async function (assert) {
    let controller = this.owner.lookup('controller:scopes/scope/roles/index');
    const searchValue = 'test';
    controller.handleSearchInput({ target: { value: searchValue } });
    await waitUntil(() => controller.search === searchValue);

    assert.strictEqual(controller.page, 1);
    assert.strictEqual(controller.search, searchValue);
  });
});
