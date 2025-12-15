/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  STATUS_SESSION_ACTIVE,
  STATUS_SESSION_PENDING,
  STATUS_SESSION_CANCELING,
  STATUS_SESSION_TERMINATED,
} from 'api/models/session';

module('Unit | Ability | session', function (hooks) {
  setupTest(hooks);

  let canService;
  let store;

  hooks.beforeEach(function () {
    canService = this.owner.lookup('service:can');
    store = this.owner.lookup('service:store');
  });

  test('it exists', function (assert) {
    const ability = this.owner.lookup('ability:session');
    assert.ok(ability);
  });

  test('can read a session that is active', function (assert) {
    const session = store.createRecord('session', {
      authorized_actions: ['read'],
      status: STATUS_SESSION_ACTIVE,
    });

    assert.true(canService.can('read session', session));
  });

  test('can read a session that is pending', function (assert) {
    const session = store.createRecord('session', {
      authorized_actions: ['read'],
      status: STATUS_SESSION_PENDING,
    });

    assert.true(canService.can('read session', session));
  });

  test('cannot read a session that is not authorized', function (assert) {
    const activeSession = store.createRecord('session', {
      authorized_actions: [],
      status: STATUS_SESSION_ACTIVE,
    });
    const pendingSession = store.createRecord('session', {
      authorized_actions: [],
      status: STATUS_SESSION_PENDING,
    });
    const cancelingSession = store.createRecord('session', {
      authorized_actions: [],
      status: STATUS_SESSION_CANCELING,
    });
    const terminatedSession = store.createRecord('session', {
      authorized_actions: [],
      status: STATUS_SESSION_TERMINATED,
    });

    assert.false(canService.can('read session', activeSession));
    assert.false(canService.can('read session', pendingSession));
    assert.false(canService.can('read session', cancelingSession));
    assert.false(canService.can('read session', terminatedSession));
  });

  test('cannot read a session that is canceling', function (assert) {
    const session = store.createRecord('session', {
      authorized_actions: ['read'],
      status: STATUS_SESSION_CANCELING,
    });

    assert.false(canService.can('read session', session));
  });

  test('cannot read a session that is terminated', function (assert) {
    const session = store.createRecord('session', {
      authorized_actions: ['read'],
      status: STATUS_SESSION_TERMINATED,
    });

    assert.false(canService.can('read session', session));
  });

  test('can read a session that has read:self', function (assert) {
    const session = store.createRecord('session', {
      authorized_actions: ['read:self'],
      status: STATUS_SESSION_ACTIVE,
    });

    assert.true(canService.can('read session', session));
  });

  test('can cancel a session that is active', function (assert) {
    const session = store.createRecord('session', {
      authorized_actions: ['cancel'],
      status: STATUS_SESSION_ACTIVE,
    });

    assert.true(canService.can('cancel session', session));
  });

  test('can cancel a session that has cancel:self', function (assert) {
    const session = store.createRecord('session', {
      authorized_actions: ['cancel:self'],
      status: STATUS_SESSION_ACTIVE,
    });

    assert.true(canService.can('cancel session', session));
  });

  test('can cancel a session that is pending', function (assert) {
    const session = store.createRecord('session', {
      authorized_actions: ['cancel'],
      status: STATUS_SESSION_PENDING,
    });

    assert.true(canService.can('cancel session', session));
  });

  test('cannot cancel a session that is canceling', function (assert) {
    const session = store.createRecord('session', {
      authorized_actions: ['cancel'],
      status: STATUS_SESSION_CANCELING,
    });

    assert.false(canService.can('cancel session', session));
  });

  test('cannot cancel a session that is terminated', function (assert) {
    const session = store.createRecord('session', {
      authorized_actions: ['cancel'],
      status: STATUS_SESSION_TERMINATED,
    });

    assert.false(canService.can('cancel session', session));
  });

  test('cannot cancel a session that is not authorized', function (assert) {
    const activeSession = store.createRecord('session', {
      authorized_actions: [],
      status: STATUS_SESSION_ACTIVE,
    });
    const pendingSession = store.createRecord('session', {
      authorized_actions: [],
      status: STATUS_SESSION_PENDING,
    });
    const cancelingSession = store.createRecord('session', {
      authorized_actions: [],
      status: STATUS_SESSION_CANCELING,
    });
    const terminatedSession = store.createRecord('session', {
      authorized_actions: [],
      status: STATUS_SESSION_TERMINATED,
    });

    assert.false(canService.can('cancel session', activeSession));
    assert.false(canService.can('cancel session', pendingSession));
    assert.false(canService.can('cancel session', cancelingSession));
    assert.false(canService.can('cancel session', terminatedSession));
  });
});
