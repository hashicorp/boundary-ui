/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | credential', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('credential', {});
    assert.ok(model);
  });

  test('it has isStatic property and returns the expected values', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('credential', { id: 'credup_123' });
    const modelB = store.createRecord('credential', { id: 'credspk_123' });
    const modelC = store.createRecord('credential', { id: 'notstatic_123' });

    assert.true(modelA.isStatic);
    assert.true(modelB.isStatic);
    assert.false(modelC.isStatic);
  });

  test('it has isJSON property and returns the expected values', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('credential', { type: 'json' });
    const modelB = store.createRecord('credential', {
      type: 'username_password',
    });
    const modelC = store.createRecord('credential', {
      type: 'ssh_private_key',
    });

    assert.true(modelA.isJSON);
    assert.false(modelB.isJSON);
    assert.false(modelC.isJSON);
  });

  test('it has isUnknown property and returns the expected values', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('credential', {
      type: 'username_password',
    });
    const modelB = store.createRecord('credential', {
      type: 'ssh_private_key',
    });
    const modelC = store.createRecord('credential', { type: 'unknown' });

    assert.false(modelA.isUnknown);
    assert.false(modelB.isUnknown);
    assert.true(modelC.isUnknown);
  });
});
