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

module('Unit | Abilities | User', function (hooks) {
  setupTest(hooks);

  let abilitiesService;
  let store;

  const instances = {
    account: null,
    user: null,
  };

  hooks.beforeEach(function () {
    abilitiesService = this.owner.lookup('service:abilities');
    store = this.owner.lookup('service:store');
    instances.user = store.createRecord('user');
    instances.account = store.createRecord('account');
  });

  test('can add accounts to user when authorized and given a known account type', function (assert) {
    instances.user.authorized_actions = ['add-accounts'];
    assert.true(abilitiesService.can('addAccounts user', instances.user));
    instances.account.type = TYPE_AUTH_METHOD_OIDC;
    assert.true(
      abilitiesService.can('addAccount user', instances.user, {
        account: instances.account,
      }),
    );
    instances.account.type = TYPE_AUTH_METHOD_PASSWORD;
    assert.true(
      abilitiesService.can('addAccount user', instances.user, {
        account: instances.account,
      }),
    );
    instances.account.type = TYPE_AUTH_METHOD_LDAP;
    assert.true(
      abilitiesService.can('addAccount user', instances.user, {
        account: instances.account,
      }),
    );
    instances.account.type = 'no-such-type';
    assert.false(
      abilitiesService.can('addAccount user', instances.user, {
        account: instances.account,
      }),
    );
  });

  test('cannot add accounts to user when unauthorized', function (assert) {
    instances.user.authorized_actions = [];
    assert.false(abilitiesService.can('addAccounts user', instances.user));
    instances.account.type = TYPE_AUTH_METHOD_OIDC;
    assert.false(
      abilitiesService.can('addAccount user', instances.user, {
        account: instances.account,
      }),
    );
    instances.account.type = TYPE_AUTH_METHOD_PASSWORD;
    assert.false(
      abilitiesService.can('addAccount user', instances.user, {
        account: instances.account,
      }),
    );
    instances.account.type = TYPE_AUTH_METHOD_LDAP;
    assert.false(
      abilitiesService.can('addAccount user', instances.user, {
        account: instances.account,
      }),
    );
    instances.account.type = 'no-such-type';
    assert.false(
      abilitiesService.can('addAccount user', instances.user, {
        account: instances.account,
      }),
    );
  });

  test('can remove accounts from user when authorized and given a known account type', function (assert) {
    instances.user.authorized_actions = ['remove-accounts'];
    assert.true(abilitiesService.can('removeAccounts user', instances.user));
    instances.account.type = TYPE_AUTH_METHOD_OIDC;
    assert.true(
      abilitiesService.can('removeAccount user', instances.user, {
        account: instances.account,
      }),
    );
    instances.account.type = TYPE_AUTH_METHOD_PASSWORD;
    assert.true(
      abilitiesService.can('removeAccount user', instances.user, {
        account: instances.account,
      }),
    );
    instances.account.type = TYPE_AUTH_METHOD_LDAP;
    assert.true(
      abilitiesService.can('removeAccount user', instances.user, {
        account: instances.account,
      }),
    );
    instances.account.type = 'no-such-type';
    assert.false(
      abilitiesService.can('removeAccount user', instances.user, {
        account: instances.account,
      }),
    );
  });

  test('cannot remove accounts from user when unauthorized', function (assert) {
    instances.user.authorized_actions = [];
    assert.false(abilitiesService.can('removeAccounts user', instances.user));
    instances.account.type = TYPE_AUTH_METHOD_OIDC;
    assert.false(
      abilitiesService.can('addAccount user', instances.user, {
        account: instances.account,
      }),
    );
    instances.account.type = TYPE_AUTH_METHOD_PASSWORD;
    assert.false(
      abilitiesService.can('removeAccount user', instances.user, {
        account: instances.account,
      }),
    );
    instances.account.type = TYPE_AUTH_METHOD_LDAP;
    assert.false(
      abilitiesService.can('removeAccount user', instances.user, {
        account: instances.account,
      }),
    );
    instances.account.type = 'no-such-type';
    assert.false(
      abilitiesService.can('removeAccount user', instances.user, {
        account: instances.account,
      }),
    );
  });
});
