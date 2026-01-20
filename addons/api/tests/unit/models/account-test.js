/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  TYPE_AUTH_METHOD_PASSWORD,
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
} from 'api/models/auth-method';

module('Unit | Model | account', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('it exists', function (assert) {
    store = this.owner.lookup('service:store');
    let model = store.createRecord('account', {});
    assert.ok(model);
  });

  test('it has an accountName attribute for password account', function (assert) {
    store = this.owner.lookup('service:store');
    let model = store.createRecord('account', {
      type: TYPE_AUTH_METHOD_PASSWORD,
    });
    assert.notOk(model.accountName);
    model.login_name = 'foobar';
    assert.strictEqual(model.accountName, 'foobar');
  });

  test('it has isPassword property and returns the expected values', function (assert) {
    const modelA = store.createRecord('account', {
      type: TYPE_AUTH_METHOD_PASSWORD,
    });
    const modelB = store.createRecord('account', {
      type: TYPE_AUTH_METHOD_OIDC,
    });
    const modelC = store.createRecord('account', {
      type: TYPE_AUTH_METHOD_LDAP,
    });
    assert.true(modelA.isPassword);
    assert.false(modelB.isPassword);
    assert.false(modelC.isPassword);
  });

  test('it has isOIDC property and returns the expected values', function (assert) {
    const modelA = store.createRecord('account', {
      type: TYPE_AUTH_METHOD_OIDC,
    });
    const modelB = store.createRecord('account', {
      type: TYPE_AUTH_METHOD_PASSWORD,
    });
    const modelC = store.createRecord('account', {
      type: TYPE_AUTH_METHOD_LDAP,
    });
    assert.true(modelA.isOIDC);
    assert.false(modelB.isOIDC);
    assert.false(modelC.isOIDC);
  });

  test('it has isLDAP property and returns the expected values', function (assert) {
    const modelA = store.createRecord('account', {
      type: TYPE_AUTH_METHOD_LDAP,
    });
    const modelB = store.createRecord('account', {
      type: TYPE_AUTH_METHOD_PASSWORD,
    });
    const modelC = store.createRecord('account', {
      type: TYPE_AUTH_METHOD_OIDC,
    });
    assert.true(modelA.isLDAP);
    assert.false(modelB.isLDAP);
    assert.false(modelC.isLDAP);
  });

  test('it has isUnknown property and returns the expected values', function (assert) {
    const modelA = store.createRecord('account', {
      type: TYPE_AUTH_METHOD_LDAP,
    });
    const modelB = store.createRecord('account', {
      type: TYPE_AUTH_METHOD_PASSWORD,
    });
    const modelC = store.createRecord('account', {
      type: TYPE_AUTH_METHOD_OIDC,
    });
    const modelD = store.createRecord('account', {
      type: 'no-such-type',
    });
    assert.false(modelA.isUnknown);
    assert.false(modelB.isUnknown);
    assert.false(modelC.isUnknown);
    assert.true(modelD.isUnknown);
  });
});
