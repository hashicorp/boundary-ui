/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Abilities | Worker', function (hooks) {
  setupTest(hooks);

  let abilitiesService;
  let store;

  const instances = {
    worker: null,
  };

  hooks.beforeEach(function () {
    abilitiesService = this.owner.lookup('service:abilities');
    store = this.owner.lookup('service:store');
    instances.worker = store.createRecord('worker');
  });

  test('can create worker-led', function (assert) {
    const model = {
      authorized_collection_actions: { workers: ['create:worker-led'] },
    };
    assert.true(
      abilitiesService.can('createWorkerLed worker', model, {
        collection: 'workers',
      }),
    );
  });

  test('cannot create worker-led', function (assert) {
    const model = {
      authorized_collection_actions: { workers: [] },
    };
    assert.true(
      abilitiesService.cannot('createWorkerLed worker', model, {
        collection: 'workers',
      }),
    );
  });

  test('can set worker tags', function (assert) {
    instances.worker.authorized_actions = ['set-worker-tags'];
    assert.true(abilitiesService.can('setWorkerTags worker', instances.worker));
  });

  test('cannot set worker tags', function (assert) {
    instances.worker.authorized_actions = [];
    assert.true(
      abilitiesService.cannot('setWorkerTags worker', instances.worker),
    );
  });
});
