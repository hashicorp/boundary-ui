/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  TYPE_CREDENTIAL_JSON,
  TYPE_CREDENTIAL_SSH_PRIVATE_KEY,
  TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
  TYPE_CREDENTIAL_USERNAME_PASSWORD
} from 'api/models/credential';


module('Unit | Model | credential', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('credential', {});
    assert.ok(model);
  });

  test('it has isStatic property and returns the expected values', async function (assert) {
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('credential', { id: 'credup_123' });
    const modelB = store.createRecord('credential', { id: 'credspk_123' });
    const modelC = store.createRecord('credential', { id: 'notstatic_123' });

    assert.true(modelA.isStatic);
    assert.true(modelB.isStatic);
    assert.false(modelC.isStatic);
  });

  test('it has isJSON property and returns the expected values', async function (assert) {
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('credential', { type: TYPE_CREDENTIAL_JSON });
    const modelB = store.createRecord('credential', {
      type: TYPE_CREDENTIAL_USERNAME_PASSWORD,
    });
    const modelC = store.createRecord('credential', {
      type: TYPE_CREDENTIAL_SSH_PRIVATE_KEY,
    });

    assert.true(modelA.isJSON);
    assert.false(modelB.isJSON);
    assert.false(modelC.isJSON);
  });

  test('it has isUnknown property and returns the expected values', async function (assert) {
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('credential', {
      type: TYPE_CREDENTIAL_USERNAME_PASSWORD
    });
    const modelB = store.createRecord('credential', {
      type: TYPE_CREDENTIAL_SSH_PRIVATE_KEY
    });
    const modelC = store.createRecord('credential', { type: 'unknown' });
    const modelD = store.createRecord('credential', { type: TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN });

    assert.false(modelA.isUnknown);
    assert.false(modelB.isUnknown);
    assert.true(modelC.isUnknown);
    assert.false(modelD.isUnknown);
  });
});
