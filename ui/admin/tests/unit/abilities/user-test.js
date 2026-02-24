/**
 * Copyright IBM Corp. 2021, 2026
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

  let abilitiesService;
  let store;
  let features;

  const instances = {
    account: null,
    user: null,
  };

  hooks.beforeEach(function () {
    abilitiesService = this.owner.lookup('service:abilities');
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
      abilitiesService.can('addAccount user', instances.user, {
        account: instances.account,
      }),
    );
  });

  test('can add non-ldap account to user', function (assert) {
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
  });

  test('cannot add ldap account to user when feature flag disabled', function (assert) {
    instances.account.type = TYPE_AUTH_METHOD_LDAP;
    assert.false(
      abilitiesService.can('addAccount user', instances.user, {
        account: instances.account,
      }),
    );
  });

  test('can remove ldap account from user when feature flag enabled', function (assert) {
    features.enable('ldap-auth-methods');
    instances.account.type = TYPE_AUTH_METHOD_LDAP;
    assert.true(
      abilitiesService.can('removeAccount user', instances.user, {
        account: instances.account,
      }),
    );
  });

  test('cannot remove ldap account from user when feature flag disabled', function (assert) {
    instances.account.type = TYPE_AUTH_METHOD_LDAP;
    assert.false(
      abilitiesService.can('removeAccount user', instances.user, {
        account: instances.account,
      }),
    );
  });

  test('can remove non-ldap account from user', function (assert) {
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
  });
});
