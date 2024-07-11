/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  TYPE_AUTH_METHOD_LDAP,
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_PASSWORD,
} from 'api/models/auth-method';

module('Unit | Abilities | user', function (hooks) {
  setupTest(hooks);

  let canService;
  let store;
  let features;

  const instances = {
    account: null,
    user: null,
  };

  hooks.beforeEach(function () {
    canService = this.owner.lookup('service:can');
    store = this.owner.lookup('service:store');
    features = this.owner.lookup('service:features');
    instances.user = store.createRecord('user', {
      authorized_actions: ['add-accounts', 'remove-accounts'],
    });
    instances.account = store.createRecord('account');
  });

  test('can add ldap account to user when feature flag enabled', function (assert) {
    features.enable('ldap-auth-methods');
    instances.account.type = TYPE_AUTH_METHOD_LDAP;
    assert.true(
      canService.can('addAccount user', instances.user, {
        account: instances.account,
      }),
    );
  });

  test('can add non-ldap account to user', function (assert) {
    instances.account.type = TYPE_AUTH_METHOD_OIDC;
    assert.true(
      canService.can('addAccount user', instances.user, {
        account: instances.account,
      }),
    );
    instances.account.type = TYPE_AUTH_METHOD_PASSWORD;
    assert.true(
      canService.can('addAccount user', instances.user, {
        account: instances.account,
      }),
    );
  });

  test('cannot add ldap account to user when feature flag disabled', function (assert) {
    instances.account.type = TYPE_AUTH_METHOD_LDAP;
    assert.false(
      canService.can('addAccount user', instances.user, {
        account: instances.account,
      }),
    );
  });

  test('can remove ldap account from user when feature flag enabled', function (assert) {
    features.enable('ldap-auth-methods');
    instances.account.type = TYPE_AUTH_METHOD_LDAP;
    assert.true(
      canService.can('removeAccount user', instances.user, {
        account: instances.account,
      }),
    );
  });

  test('cannot remove ldap account from user when feature flag disabled', function (assert) {
    instances.account.type = TYPE_AUTH_METHOD_LDAP;
    assert.false(
      canService.can('removeAccount user', instances.user, {
        account: instances.account,
      }),
    );
  });

  test('can remove non-ldap account from user', function (assert) {
    instances.account.type = TYPE_AUTH_METHOD_OIDC;
    assert.true(
      canService.can('removeAccount user', instances.user, {
        account: instances.account,
      }),
    );
    instances.account.type = TYPE_AUTH_METHOD_PASSWORD;
    assert.true(
      canService.can('removeAccount user', instances.user, {
        account: instances.account,
      }),
    );
  });
});
