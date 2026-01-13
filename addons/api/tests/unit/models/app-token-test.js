/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | app token', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('app-token', {});
    assert.ok(model, 'model exists');
  });

  test('it has an `isActive` computed property that returns expected values', async function (assert) {
    const store = this.owner.lookup('service:store');
    const modelActive = store.createRecord('app-token', {
      status: 'active',
    });
    const modelRevoked = store.createRecord('app-token', {
      status: 'revoked',
    });
    const modelStale = store.createRecord('app-token', {
      status: 'stale',
    });
    const modelExpired = store.createRecord('app-token', {
      status: 'expired',
    });
    assert.strictEqual(typeof modelActive.isActive, 'boolean');
    assert.true(modelActive.isActive);
    assert.false(modelRevoked.isActive);
    assert.false(modelStale.isActive);
    assert.false(modelExpired.isActive);
  });

  test('it has a `TTL` computed property that returns expected values', async function (assert) {
    const store = this.owner.lookup('service:store');
    const now = new Date();
    const later = new Date(now.getTime() + 60000); // 1 minute later
    const modelWithTTL = store.createRecord('app-token', {
      created_time: now,
      expire_time: later,
    });
    const modelWithoutTTL = store.createRecord('app-token', {
      created_time: now,
      expire_time: null,
    });
    assert.strictEqual(typeof modelWithTTL.TTL, 'number');
    assert.strictEqual(modelWithTTL.TTL, 60000);
    assert.strictEqual(modelWithoutTTL.TTL, null);
  });

  test('it has a `TTS` computed property that returns expected values', async function (assert) {
    const store = this.owner.lookup('service:store');
    const modelWithTTS = store.createRecord('app-token', {
      time_to_stale_seconds: 120,
    });
    const modelWithoutTTS = store.createRecord('app-token', {
      time_to_stale_seconds: null,
    });
    assert.strictEqual(typeof modelWithTTS.TTS, 'number');
    assert.strictEqual(modelWithTTS.TTS, 120000);
    assert.strictEqual(modelWithoutTTS.TTS, null);
  });

  test('it has an `expiresIn` computed property that returns expected values', async function (assert) {
    const store = this.owner.lookup('service:store');
    const now = new Date();
    const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days later

    const modelWithExpiration = store.createRecord('app-token', {
      expire_time: inFiveDays,
    });
    const modelWithoutExpiration = store.createRecord('app-token', {
      expire_time: null,
    });

    assert.strictEqual(typeof modelWithExpiration.expiresIn, 'number');
    assert.strictEqual(modelWithExpiration.expiresIn, 5);
    assert.strictEqual(modelWithoutExpiration.expiresIn, null);
  });

  test('it has a `hasPermissionWithEmptyActiveScopes` computed property that returns expected values', async function (assert) {
    const store = this.owner.lookup('service:store');

    const modelWithEmptyScopes = store.createRecord('app-token', {
      permissions: [{ grant_scopes: ['scope-1'] }, { grant_scopes: [] }],
    });
    const modelWithoutEmptyScopes = store.createRecord('app-token', {
      permissions: [
        { grant_scopes: ['scope-1'] },
        { grant_scopes: ['scope-2'] },
      ],
    });

    assert.true(modelWithEmptyScopes.hasPermissionWithEmptyActiveScopes);
    assert.false(modelWithoutEmptyScopes.hasPermissionWithEmptyActiveScopes);
  });
});
