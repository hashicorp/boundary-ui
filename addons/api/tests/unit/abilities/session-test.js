/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
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
    assert.expect(1);

    const session = store.createRecord('session', {
      authorized_actions: ['read'],
      status: STATUS_SESSION_ACTIVE,
    });

    assert.true(canService.can('read session', session));
  });

  test('can read a session that is pending', function (assert) {
    assert.expect(1);

    const session = store.createRecord('session', {
      authorized_actions: ['read'],
      status: STATUS_SESSION_PENDING,
    });

    assert.true(canService.can('read session', session));
  });

  test('cannot read a session that is not authorized', function (assert) {
    assert.expect(4);

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
    assert.expect(1);

    const session = store.createRecord('session', {
      authorized_actions: ['read'],
      status: STATUS_SESSION_CANCELING,
    });

    assert.false(canService.can('read session', session));
  });

  test('cannot read a session that is terminated', function (assert) {
    assert.expect(1);

    const session = store.createRecord('session', {
      authorized_actions: ['read'],
      status: STATUS_SESSION_TERMINATED,
    });

    assert.false(canService.can('read session', session));
  });
});
