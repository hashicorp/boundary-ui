/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Abilities | Scope', function (hooks) {
  setupTest(hooks);

  let canService;

  hooks.beforeEach(function () {
    canService = this.owner.lookup('service:can');
  });
  test('it exists', function (assert) {
    const ability = this.owner.lookup('ability:scope');
    assert.ok(ability);
  });

  test('it reflects when a given scope may attach a policy in global scope', function (assert) {
    const model = {
      authorized_actions: ['attach-storage-policy'],
    };
    assert.true(canService.can('attachStoragePolicy scope', model));
    model.authorized_actions = [];
    assert.false(canService.can('attachStoragePolicy scope', model));
  });

  test('it reflects when a given scope may remove a policy in org scope', function (assert) {
    const model = {
      authorized_actions: ['detach-storage-policy'],
    };

    assert.true(canService.can('detachStoragePolicy scope', model));
    model.authorized_actions = [];
    assert.false(canService.can('detachStoragePolicy scope', model));
  });
});
