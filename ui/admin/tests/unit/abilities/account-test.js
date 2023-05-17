/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  TYPE_AUTH_METHOD_LDAP,
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_PASSWORD,
} from 'api/models/auth-method';

module('Unit | Abilities | account', function (hooks) {
  setupTest(hooks);

  let canService;
  let store;
  let features;

  hooks.beforeEach(function () {
    canService = this.owner.lookup('service:can');
    store = this.owner.lookup('service:store');
    features = this.owner.lookup('service:features');
  });

  test('can add ldap account to user when feature flag enabled', function (assert) {
    assert.expect(1);
    features.enable('ldap-auth-methods');
    const account = store.createRecord('account', {
      type: TYPE_AUTH_METHOD_LDAP,
    });
    assert.true(canService.can('addAccount account', account));
  });

  test('can add non-ldap account to user', function (assert) {
    assert.expect(2);
    const account = store.createRecord('account', {
      type: TYPE_AUTH_METHOD_OIDC,
    });
    assert.true(canService.can('addAccount account', account));
    account.type = TYPE_AUTH_METHOD_PASSWORD;
    assert.true(canService.can('addAccount account', account));
  });

  test('cannot add ldap account to user when feature flag disabled', function (assert) {
    assert.expect(1);
    const account = store.createRecord('account', {
      type: TYPE_AUTH_METHOD_LDAP,
    });
    assert.false(canService.can('addAccount account', account));
  });

  test('can remove ldap account from user when feature flag enabled', function (assert) {
    assert.expect(1);
    features.enable('ldap-auth-methods');
    const account = store.createRecord('account', {
      type: TYPE_AUTH_METHOD_LDAP,
    });
    assert.true(canService.can('removeAccount account', account));
  });

  test('cannot remove ldap account from user when feature flag disabled', function (assert) {
    assert.expect(1);
    const account = store.createRecord('account', {
      type: TYPE_AUTH_METHOD_LDAP,
    });
    assert.false(canService.can('removeAccount account', account));
  });

  test('can remove non-ldap account from user', function (assert) {
    assert.expect(2);
    const account = store.createRecord('account', {
      type: TYPE_AUTH_METHOD_OIDC,
    });
    assert.true(canService.can('removeAccount account', account));
    (account.type = TYPE_AUTH_METHOD_PASSWORD),
      assert.true(canService.can('removeAccount account', account));
  });
});
