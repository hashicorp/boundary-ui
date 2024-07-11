/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | session', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('session', {});
    assert.ok(model);
    assert.notOk(model.isAvailable);
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
