/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Abilities | Scope', function (hooks) {
  setupTest(hooks);

  let features;
  let abilitiesService;
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    abilitiesService = this.owner.lookup('service:abilities');
    features = this.owner.lookup('service:features');
  });

  test('can attach storage policy when authorized', function (assert) {
    features.enable('ssh-session-recording');

    const scopeModel = store.createRecord('scope', {
      authorized_actions: ['attach-storage-policy'],
    });
    assert.true(abilitiesService.can('attachStoragePolicy scope', scopeModel));
  });

  test('cannot attach storage policy when unauthorized', function (assert) {
    features.enable('ssh-session-recording');

    const scopeModel = store.createRecord('scope', {
      authorized_actions: [],
    });

    assert.false(abilitiesService.can('attachStoragePolicy scope', scopeModel));
  });

  test('can detach storage policy when authorized', function (assert) {
    features.enable('ssh-session-recording');

    const scopeModel = store.createRecord('scope', {
      authorized_actions: ['detach-storage-policy'],
    });
    assert.true(abilitiesService.can('detachStoragePolicy scope', scopeModel));
  });
});
