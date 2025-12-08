/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Abilities | Scope', function (hooks) {
  setupTest(hooks);

  let features;
  let canService;
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    canService = this.owner.lookup('service:can');
    features = this.owner.lookup('service:features');
  });

  test('can attach storage policy when authorized', function (assert) {
    features.enable('ssh-session-recording');

    const scopeModel = store.createRecord('scope', {
      authorized_actions: ['attach-storage-policy'],
    });
    assert.true(canService.can('attachStoragePolicy scope', scopeModel));
  });

  test('cannot attach storage policy when unauthorized', function (assert) {
    features.enable('ssh-session-recording');

    const scopeModel = store.createRecord('scope', {
      authorized_actions: [],
    });

    assert.false(canService.can('attachStoragePolicy scope', scopeModel));
  });

  test('can detach storage policy when authorized', function (assert) {
    features.enable('ssh-session-recording');

    const scopeModel = store.createRecord('scope', {
      authorized_actions: ['detach-storage-policy'],
    });
    assert.true(canService.can('detachStoragePolicy scope', scopeModel));
  });
});
