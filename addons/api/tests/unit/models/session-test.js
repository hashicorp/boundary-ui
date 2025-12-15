/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { SessionCredential } from 'api/models/session';
import { TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC } from 'api/models/credential-library';

module('Unit | Model | session', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('session', {});
    assert.ok(model);
    assert.notOk(model.isAvailable);
  });

  test('`extractSecrets` method should return an array of secret items', function (assert) {
    const sessionCredential = new SessionCredential({
      credential_source: {
        id: '123',
        name: 'Test Source',
        description: 'Test Description',
        type: 'Test Type',
      },
    });

    const secrets = {
      username: 'user',
      password: 'pass',
    };

    const formattedSecretes = sessionCredential.extractSecrets(
      secrets,
      TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
    );
    assert.deepEqual(formattedSecretes, [
      new SessionCredential.SecretItem('username', 'user'),
      new SessionCredential.SecretItem('password', 'pass'),
    ]);

    // check for nested data, empty values should be filtered out
    const nestedSecrets = {
      data: { username: 'user', password: '', email: 'test.com' },
    };

    const formattedNestedSecrets = sessionCredential.extractSecrets(
      nestedSecrets,
      TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
    );

    assert.deepEqual(formattedNestedSecrets, [
      new SessionCredential.SecretItem('username', 'user'),
      new SessionCredential.SecretItem('email', 'test.com'),
    ]);
  });

  test('it allows cancellation of an active session', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('session', {
      status: 'active',
    });
    assert.ok(model.isAvailable);
  });

  test('it allows cancellation of a pending session', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('session', {
      status: 'pending',
    });
    assert.ok(model.isAvailable);
  });

  test('it computes isActive', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('session', {
      status: 'pending',
    });
    assert.notOk(model.isActive);
    model.status = 'active';
    assert.ok(model.isActive);
  });

  test('it computes isPending', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('session', {
      status: 'active',
    });
    assert.notOk(model.isPending);
    model.status = 'pending';
    assert.ok(model.isPending);
  });

  test('it computes a proxy attribute', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('session');
    assert.strictEqual(model.proxy, null);
    model.setProperties({
      proxy_address: 'localhost',
      proxy_port: '12345',
    });
    assert.strictEqual(model.proxy, 'localhost:12345');
  });

  test('it has isUnknownStatus property and returns the expected values', async function (assert) {
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('session', { status: 'active' });
    const modelB = store.createRecord('session', {
      status: 'any string',
    });
    assert.false(modelA.isUnknownStatus);
    assert.true(modelB.isUnknownStatus);
  });

  test('it has target property and returns the null with no target_id set', function (assert) {
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: 's_123',
        type: 'session',
        attributes: { target_id: null },
      },
    });
    const session = store.peekRecord('session', 's_123');

    assert.strictEqual(session.target, null);
  });

  test('it has target property and returns the correct target', function (assert) {
    const store = this.owner.lookup('service:store');
    const targetId = 'ttcp_123';
    store.push({
      data: {
        id: targetId,
        type: 'target',
        attributes: {
          name: 'admin',
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    store.push({
      data: {
        id: 's_123',
        type: 'session',
        attributes: { target_id: targetId },
      },
    });
    const session = store.peekRecord('session', 's_123');

    assert.strictEqual(session.target.id, targetId);
  });

  test('it has user property and returns the null with no user_id set', function (assert) {
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: 's_123',
        type: 'session',
        attributes: { user_id: null },
      },
    });
    const session = store.peekRecord('session', 's_123');

    assert.strictEqual(session.user, null);
  });

  test('it has user property and returns the correct user', function (assert) {
    const store = this.owner.lookup('service:store');
    const userId = 'u_123';
    store.push({
      data: {
        id: userId,
        type: 'user',
        attributes: {
          name: 'admin',
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    store.push({
      data: {
        id: 's_123',
        type: 'session',
        attributes: { user_id: userId },
      },
    });
    const session = store.peekRecord('session', 's_123');

    assert.strictEqual(session.user.id, userId);
  });
});
