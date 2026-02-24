/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Abilities | Scope', function (hooks) {
  setupTest(hooks);

  let abilitiesService;

  hooks.beforeEach(function () {
    abilitiesService = this.owner.lookup('service:abilities');
  });
  test('it exists', function (assert) {
    const ability = this.owner.lookup('ability:scope');
    assert.ok(ability);
  });

  test('it reflects when a given scope may attach a policy in global scope', function (assert) {
    const model = {
      authorized_actions: ['attach-storage-policy'],
    };
    assert.true(abilitiesService.can('attachStoragePolicy scope', model));
    model.authorized_actions = [];
    assert.false(abilitiesService.can('attachStoragePolicy scope', model));
  });

  test('it reflects when a given scope may remove a policy in org scope', function (assert) {
    const model = {
      authorized_actions: ['detach-storage-policy'],
    };

    assert.true(abilitiesService.can('detachStoragePolicy scope', model));
    model.authorized_actions = [];
    assert.false(abilitiesService.can('detachStoragePolicy scope', model));
  });
});
