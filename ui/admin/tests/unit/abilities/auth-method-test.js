/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  TYPE_AUTH_METHOD_LDAP,
  TYPE_AUTH_METHOD_OIDC,
} from 'api/models/auth-method';

module('Unit | Abilities | auth-method', function (hooks) {
  setupTest(hooks);

  let canService;
  let store;

  hooks.beforeEach(function () {
    canService = this.owner.lookup('service:can');
    store = this.owner.lookup('service:store');
  });

  test('cannot read LDAP auth-method when authorized', function (assert) {
    assert.expect(1);
    const authMethod = store.createRecord('auth-method', {
      authorized_actions: ['read'],
      type: TYPE_AUTH_METHOD_LDAP,
    });
    assert.false(canService.can('read auth-method', authMethod));
  });

  test('cannot read LDAP auth-method when unauthorized', function (assert) {
    assert.expect(1);
    const authMethod = store.createRecord('auth-method', {
      authorized_actions: [],
      type: TYPE_AUTH_METHOD_LDAP,
    });
    assert.false(canService.can('read auth-method', authMethod));
  });

  test('can read non-LDAP auth-method when authorized', function (assert) {
    assert.expect(1);
    const authMethod = store.createRecord('auth-method', {
      authorized_actions: ['read'],
      type: TYPE_AUTH_METHOD_OIDC,
    });
    assert.true(canService.can('read auth-method', authMethod));
  });

  test('cannot read non-LDAP auth-method when unauthorized', function (assert) {
    assert.expect(1);
    const authMethod = store.createRecord('auth-method', {
      authorized_actions: [],
      type: TYPE_AUTH_METHOD_OIDC,
    });
    assert.false(canService.can('read auth-method', authMethod));
  });

  test('cannot make LDAP auth-method primary', function (assert) {
    assert.expect(1);
    const authMethod = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_LDAP,
    });
    assert.false(canService.can('makePrimary auth-method', authMethod));
  });

  test('can make non-LDAP auth-method primary', function (assert) {
    assert.expect(1);
    const authMethod = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_OIDC,
    });
    assert.true(canService.can('makePrimary auth-method', authMethod));
  });
});
