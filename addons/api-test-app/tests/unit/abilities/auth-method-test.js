/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  TYPE_AUTH_METHOD_PASSWORD,
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
} from 'api/models/auth-method';

module('Unit | Abilities | Auth Method', function (hooks) {
  setupTest(hooks);

  let canService;
  let store;

  hooks.beforeEach(function () {
    canService = this.owner.lookup('service:can');
    store = this.owner.lookup('service:store');
  });

  test('can read known auth method types when authorized', function (assert) {
    const authMethod = store.createRecord('auth-method', {
      authorized_actions: ['read'],
      type: TYPE_AUTH_METHOD_OIDC,
    });
    assert.true(canService.can('read auth-method', authMethod));
    authMethod.type = TYPE_AUTH_METHOD_PASSWORD;
    assert.true(canService.can('read auth-method', authMethod));
    authMethod.type = TYPE_AUTH_METHOD_LDAP;
    assert.true(canService.can('read auth-method', authMethod));
    authMethod.type = 'no-such-type';
    assert.false(canService.can('read auth-method', authMethod));
  });

  test('cannot read auth methods when unauthorized', function (assert) {
    const authMethod = store.createRecord('auth-method', {
      authorized_actions: [],
      type: TYPE_AUTH_METHOD_OIDC,
    });
    assert.false(canService.can('read auth-method', authMethod));
    authMethod.type = TYPE_AUTH_METHOD_PASSWORD;
    assert.false(canService.can('read auth-method', authMethod));
    authMethod.type = TYPE_AUTH_METHOD_LDAP;
    assert.false(canService.can('read auth-method', authMethod));
    authMethod.type = 'no-such-type';
    assert.false(canService.can('read auth-method', authMethod));
  });

  test('can delete known auth method types when authorized', function (assert) {
    const authMethod = store.createRecord('auth-method', {
      authorized_actions: ['delete'],
      type: TYPE_AUTH_METHOD_OIDC,
    });
    assert.true(canService.can('delete auth-method', authMethod));
    authMethod.type = TYPE_AUTH_METHOD_PASSWORD;
    assert.true(canService.can('delete auth-method', authMethod));
    authMethod.type = TYPE_AUTH_METHOD_LDAP;
    assert.true(canService.can('delete auth-method', authMethod));
    authMethod.type = 'no-such-type';
    assert.false(canService.can('delete auth-method', authMethod));
  });

  test('cannot delete auth methods when unauthorized', function (assert) {
    const authMethod = store.createRecord('auth-method', {
      authorized_actions: ['delete'],
      type: TYPE_AUTH_METHOD_OIDC,
    });
    assert.true(canService.can('delete auth-method', authMethod));
    authMethod.type = TYPE_AUTH_METHOD_PASSWORD;
    assert.true(canService.can('delete auth-method', authMethod));
    authMethod.type = TYPE_AUTH_METHOD_LDAP;
    assert.true(canService.can('delete auth-method', authMethod));
    authMethod.type = 'no-such-type';
    assert.false(canService.can('delete auth-method', authMethod));
  });

  test('can update known auth method types when authorized', function (assert) {
    const authMethod = store.createRecord('auth-method', {
      authorized_actions: ['update'],
      type: TYPE_AUTH_METHOD_OIDC,
    });
    assert.true(canService.can('update auth-method', authMethod));
    authMethod.type = TYPE_AUTH_METHOD_PASSWORD;
    assert.true(canService.can('update auth-method', authMethod));
    authMethod.type = TYPE_AUTH_METHOD_LDAP;
    assert.true(canService.can('update auth-method', authMethod));
    authMethod.type = 'no-such-type';
    assert.false(canService.can('update auth-method', authMethod));
  });

  test('cannot update auth methods when unauthorized', function (assert) {
    const authMethod = store.createRecord('auth-method', {
      authorized_actions: [],
      type: TYPE_AUTH_METHOD_OIDC,
    });
    assert.false(canService.can('update auth-method', authMethod));
    authMethod.type = TYPE_AUTH_METHOD_PASSWORD;
    assert.false(canService.can('update auth-method', authMethod));
    authMethod.type = TYPE_AUTH_METHOD_LDAP;
    assert.false(canService.can('update auth-method', authMethod));
    authMethod.type = 'no-such-type';
    assert.false(canService.can('update auth-method', authMethod));
  });
});
