/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Abilities | Model', function (hooks) {
  setupTest(hooks);

  test('it reflects when a given model may be read based on authorized_actions', function (assert) {
    const service = this.owner.lookup('service:can');
    const model = {
      authorized_actions: ['read'],
    };
    assert.ok(service.can('read model', model));
    model.authorized_actions = [];
    assert.notOk(service.can('read model', model));
  });

  test('it reflects when a given model may be updated based on authorized_actions', function (assert) {
    const service = this.owner.lookup('service:can');
    const model = {
      authorized_actions: ['update'],
    };
    assert.ok(service.can('update model', model));
    model.authorized_actions = [];
    assert.notOk(service.can('update model', model));
  });

  test('it reflects when a given model may be saved based on isNew and authorized_actions', function (assert) {
    const service = this.owner.lookup('service:can');
    let model = {
      isNew: false,
      authorized_actions: ['update'],
    };
    assert.ok(service.can('save model', model));
    model = {
      isNew: false,
      authorized_actions: [],
    };
    assert.notOk(service.can('save model', model));
    // Model instances are always saveable at this level when isNew is true.
    // In practice, the ability to _create_ a resource depends not on instance
    // authorization, but on collection authorization, which is
    // tested separately.
    model = {
      isNew: true,
      authorized_actions: ['update'],
    };
    assert.ok(service.can('save model', model));
    model = {
      isNew: true,
      authorized_actions: [],
    };
    assert.ok(service.can('save model', model));
  });

  test('it reflects when a given model may be deleted based on authorized_actions', function (assert) {
    const service = this.owner.lookup('service:can');
    const model = {
      authorized_actions: ['delete'],
    };
    assert.ok(service.can('delete model', model));
    model.authorized_actions = [];
    assert.notOk(service.can('delete model', model));
  });

  // =collections

  test('it reflects when a resource may be listed based on authorized_collection_actions', function (assert) {
    const service = this.owner.lookup('service:can');
    const model = {
      authorized_collection_actions: {
        foobars: ['list'],
      },
    };
    assert.ok(service.can('list model', model, { collection: 'foobars' }));
    model.authorized_collection_actions.foobars = [];
    assert.notOk(service.can('list model', model, { collection: 'foobars' }));
  });

  test('it reflects when a resource may be created based on authorized_collection_actions', function (assert) {
    const service = this.owner.lookup('service:can');
    const model = {
      authorized_collection_actions: {
        foobars: ['create'],
      },
    };
    assert.ok(service.can('create model', model, { collection: 'foobars' }));
    model.authorized_collection_actions.foobars = [];
    assert.notOk(service.can('create model', model, { collection: 'foobars' }));
  });
});
