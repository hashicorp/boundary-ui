/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | credential store', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('credential-store', {});
    assert.ok(model);
  });

  test('it has a `isStatic` computed property and returns the expected values', async function (assert) {
    const store = this.owner.lookup('service:store');
    const modelStatic = store.createRecord('credential-store', {
      type: 'static',
    });
    const modelVault = store.createRecord('credential-store', {
      type: 'vault',
    });
    assert.strictEqual(typeof modelStatic.isStatic, 'boolean');
    assert.true(modelStatic.isStatic);
    assert.false(modelVault.isStatic);
  });

  test('it has a `isVault` computed property and returns the expected values', async function (assert) {
    const store = this.owner.lookup('service:store');
    const modelVault = store.createRecord('credential-store', {
      type: 'vault',
    });
    const modelStatic = store.createRecord('credential-store', {
      type: 'static',
    });
    assert.strictEqual(typeof modelVault.isVault, 'boolean');
    assert.true(modelVault.isVault);
    assert.false(modelStatic.isVault);
  });
});
