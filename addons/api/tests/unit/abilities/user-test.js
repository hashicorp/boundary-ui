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

module('Unit | Abilities | User', function (hooks) {
  setupTest(hooks);

  let canService;
  let store;

  const instances = {
    account: null,
    user: null,
  };

  hooks.beforeEach(function () {
    canService = this.owner.lookup('service:can');
    store = this.owner.lookup('service:store');
    instances.user = store.createRecord('user');
    instances.account = store.createRecord('account');
  });

  test('can add accounts to user when authorized and given a known account type', function (assert) {
    instances.user.authorized_actions = ['add-accounts'];
    assert.true(canService.can('addAccounts user', instances.user));
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
    instances.account.type = TYPE_AUTH_METHOD_LDAP;
    assert.true(
      canService.can('addAccount user', instances.user, {
        account: instances.account,
      }),
    );
    instances.account.type = 'no-such-type';
    assert.false(
      canService.can('addAccount user', instances.user, {
        account: instances.account,
      }),
    );
  });

  test('cannot add accounts to user when unauthorized', function (assert) {
    instances.user.authorized_actions = [];
    assert.false(canService.can('addAccounts user', instances.user));
    instances.account.type = TYPE_AUTH_METHOD_OIDC;
    assert.false(
      canService.can('addAccount user', instances.user, {
        account: instances.account,
      }),
    );
    instances.account.type = TYPE_AUTH_METHOD_PASSWORD;
    assert.false(
      canService.can('addAccount user', instances.user, {
        account: instances.account,
      }),
    );
    instances.account.type = TYPE_AUTH_METHOD_LDAP;
    assert.false(
      canService.can('addAccount user', instances.user, {
        account: instances.account,
      }),
    );
    instances.account.type = 'no-such-type';
    assert.false(
      canService.can('addAccount user', instances.user, {
        account: instances.account,
      }),
    );
  });

  test('can remove accounts from user when authorized and given a known account type', function (assert) {
    instances.user.authorized_actions = ['remove-accounts'];
    assert.true(canService.can('removeAccounts user', instances.user));
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
    instances.account.type = TYPE_AUTH_METHOD_LDAP;
    assert.true(
      canService.can('removeAccount user', instances.user, {
        account: instances.account,
      }),
    );
    instances.account.type = 'no-such-type';
    assert.false(
      canService.can('removeAccount user', instances.user, {
        account: instances.account,
      }),
    );
  });

  test('cannot remove accounts from user when unauthorized', function (assert) {
    instances.user.authorized_actions = [];
    assert.false(canService.can('removeAccounts user', instances.user));
    instances.account.type = TYPE_AUTH_METHOD_OIDC;
    assert.false(
      canService.can('addAccount user', instances.user, {
        account: instances.account,
      }),
    );
    instances.account.type = TYPE_AUTH_METHOD_PASSWORD;
    assert.false(
      canService.can('removeAccount user', instances.user, {
        account: instances.account,
      }),
    );
    instances.account.type = TYPE_AUTH_METHOD_LDAP;
    assert.false(
      canService.can('removeAccount user', instances.user, {
        account: instances.account,
      }),
    );
    instances.account.type = 'no-such-type';
    assert.false(
      canService.can('removeAccount user', instances.user, {
        account: instances.account,
      }),
    );
  });
});
