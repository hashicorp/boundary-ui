/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  TYPE_AUTH_METHOD_PASSWORD,
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
} from 'api/models/auth-method';

module('Unit | Abilities | Account', function (hooks) {
  setupTest(hooks);

  let canService;
  let store;

  hooks.beforeEach(function () {
    canService = this.owner.lookup('service:can');
    store = this.owner.lookup('service:store');
  });

  test('it reflects when a given account may set password based on authorized_actions', function (assert) {
    const account = store.createRecord('auth-method', {
      authorized_actions: ['set-password'],
    });
    assert.true(canService.can('setPassword account', account));
    account.authorized_actions = [];
    assert.false(canService.can('setPassword account', account));
  });

  test('can read known account types when authorized', function (assert) {
    const account = store.createRecord('account', {
      authorized_actions: ['read'],
      type: TYPE_AUTH_METHOD_OIDC,
    });
    assert.true(canService.can('read account', account));
    account.type = TYPE_AUTH_METHOD_PASSWORD;
    assert.true(canService.can('read account', account));
    account.type = TYPE_AUTH_METHOD_LDAP;
    assert.true(canService.can('read account', account));
    account.type = 'no-such-type';
    assert.false(canService.can('read account', account));
  });

  test('cannot read accounts when unauthorized', function (assert) {
    const account = store.createRecord('account', {
      authorized_actions: [],
      type: TYPE_AUTH_METHOD_OIDC,
    });
    assert.false(canService.can('read account', account));
    account.type = TYPE_AUTH_METHOD_PASSWORD;
    assert.false(canService.can('read account', account));
    account.type = TYPE_AUTH_METHOD_LDAP;
    assert.false(canService.can('read account', account));
    account.type = 'no-such-type';
    assert.false(canService.can('read account', account));
  });

  test('can delete known account types when authorized', function (assert) {
    const account = store.createRecord('account', {
      authorized_actions: ['delete'],
      type: TYPE_AUTH_METHOD_OIDC,
    });
    assert.true(canService.can('delete account', account));
    account.type = TYPE_AUTH_METHOD_PASSWORD;
    assert.true(canService.can('delete account', account));
    account.type = TYPE_AUTH_METHOD_LDAP;
    assert.true(canService.can('delete account', account));
    account.type = 'no-such-type';
    assert.false(canService.can('delete account', account));
  });

  test('cannot delete accounts when unauthorized', function (assert) {
    const account = store.createRecord('account', {
      authorized_actions: ['delete'],
      type: TYPE_AUTH_METHOD_OIDC,
    });
    assert.true(canService.can('delete account', account));
    account.type = TYPE_AUTH_METHOD_PASSWORD;
    assert.true(canService.can('delete account', account));
    account.type = TYPE_AUTH_METHOD_LDAP;
    assert.true(canService.can('delete account', account));
    account.type = 'no-such-type';
    assert.false(canService.can('delete account', account));
  });

  test('can update known account types when authorized', function (assert) {
    const account = store.createRecord('account', {
      authorized_actions: ['update'],
      type: TYPE_AUTH_METHOD_OIDC,
    });
    assert.true(canService.can('update account', account));
    account.type = TYPE_AUTH_METHOD_PASSWORD;
    assert.true(canService.can('update account', account));
    account.type = TYPE_AUTH_METHOD_LDAP;
    assert.true(canService.can('update account', account));
    account.type = 'no-such-type';
    assert.false(canService.can('update account', account));
  });

  test('cannot update accounts when unauthorized', function (assert) {
    const account = store.createRecord('account', {
      authorized_actions: [],
      type: TYPE_AUTH_METHOD_OIDC,
    });
    assert.false(canService.can('update account', account));
    account.type = TYPE_AUTH_METHOD_PASSWORD;
    assert.false(canService.can('update account', account));
    account.type = TYPE_AUTH_METHOD_LDAP;
    assert.false(canService.can('update account', account));
    account.type = 'no-such-type';
    assert.false(canService.can('update account', account));
  });
});
