/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
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
    assert.expect(2);
    const account = store.createRecord('auth-method', {
      authorized_actions: ['set-password'],
    });
    assert.true(canService.can('setPassword account', account));
    account.authorized_actions = [];
    assert.false(canService.can('setPassword account', account));
  });

  test('can read OIDC account type depending on authorization', function (assert) {
    assert.expect(2);
    const account = store.createRecord('account', {
      authorized_actions: ['read'],
      type: TYPE_AUTH_METHOD_OIDC,
    });
    assert.true(canService.can('read account', account));
    account.authorized_actions = [];
    assert.false(canService.can('read account', account));
  });

  test('can read password account type depending on authoriztion', function (assert) {
    assert.expect(2);
    const account = store.createRecord('account', {
      authorized_actions: ['read'],
      type: TYPE_AUTH_METHOD_PASSWORD,
    });
    assert.true(canService.can('read account', account));
    account.authorized_actions = [];
    assert.false(canService.can('read account', account));
  });

  test('can read LDAP account type depending on authorization', function (assert) {
    assert.expect(2);
    const account = store.createRecord('account', {
      authorized_actions: ['read'],
      type: TYPE_AUTH_METHOD_LDAP,
    });
    assert.true(canService.can('read account', account));
    account.authorized_actions = [];
    assert.false(canService.can('read account', account));
  });

  test('cannot read unknown account types depending on authorization', function (assert) {
    assert.expect(2);
    const account = store.createRecord('account', {
      authorized_actions: ['read'],
      type: 'no-such-type',
    });
    assert.false(canService.can('read account', account));
    account.authorized_actions = [];
    assert.false(canService.can('read account', account));
  });
});
