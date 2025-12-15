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

module('Unit | Abilities | auth-method', function (hooks) {
  setupTest(hooks);

  let canService;
  let store;
  let features;

  hooks.beforeEach(function () {
    canService = this.owner.lookup('service:can');
    store = this.owner.lookup('service:store');
    features = this.owner.lookup('service:features');
  });

  test('can read LDAP auth-method when authorized and feature flag enabled', function (assert) {
    features.enable('ldap-auth-methods');
    const authMethod = store.createRecord('auth-method', {
      authorized_actions: ['read'],
      type: TYPE_AUTH_METHOD_LDAP,
    });
    assert.true(canService.can('read auth-method', authMethod));
    authMethod.authorized_actions = [];
    assert.false(canService.can('read auth-method', authMethod));
  });

  test('cannot read LDAP auth-method when authorized and feature flag disabled', function (assert) {
    const authMethod = store.createRecord('auth-method', {
      authorized_actions: ['read'],
      type: TYPE_AUTH_METHOD_LDAP,
    });
    assert.false(canService.can('read auth-method', authMethod));
    authMethod.authorized_actions = [];
    assert.false(canService.can('read auth-method', authMethod));
  });

  test('can read non-LDAP auth-method when authorized', function (assert) {
    const authMethod = store.createRecord('auth-method', {
      authorized_actions: ['read'],
      type: TYPE_AUTH_METHOD_OIDC,
    });
    assert.true(canService.can('read auth-method', authMethod));
    authMethod.type = TYPE_AUTH_METHOD_PASSWORD;
    assert.true(canService.can('read auth-method', authMethod));
  });

  test('cannot read non-LDAP auth-method when unauthorized', function (assert) {
    const authMethod = store.createRecord('auth-method', {
      authorized_actions: [],
      type: TYPE_AUTH_METHOD_OIDC,
    });
    assert.false(canService.can('read auth-method', authMethod));
    authMethod.type = TYPE_AUTH_METHOD_PASSWORD;
    assert.false(canService.can('read auth-method', authMethod));
  });

  test('cannot make LDAP auth-method primary when feature flag disabled', function (assert) {
    const authMethod = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_LDAP,
    });
    assert.false(canService.can('makePrimary auth-method', authMethod));
  });

  test('can make LDAP auth-method primary when feature flag enabled', function (assert) {
    features.enable('ldap-auth-methods');
    const authMethod = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_LDAP,
    });
    assert.true(canService.can('makePrimary auth-method', authMethod));
  });

  test('can make non-LDAP auth-method primary', function (assert) {
    const authMethod = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_OIDC,
    });
    assert.true(canService.can('makePrimary auth-method', authMethod));
    authMethod.type = TYPE_AUTH_METHOD_PASSWORD;
    assert.true(canService.can('makePrimary auth-method', authMethod));
  });
});
