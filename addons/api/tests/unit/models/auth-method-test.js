/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'dummy/tests/helpers/mirage';
import {
  TYPE_AUTH_METHOD_PASSWORD,
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
} from 'api/models/auth-method';

module('Unit | Model | auth method', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('it exists', function (assert) {
    let model = store.createRecord('auth-method', {});
    assert.ok(model);
  });

  test('it has a `changeState` method that targets a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post('/auth-methods/123abc:change-state', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        attributes: {
          state: 'foobar',
        },
        version: 1,
      });
      return { id: '123abc' };
    });
    store.push({
      data: {
        id: '123abc',
        type: 'auth-method',
        attributes: {
          type: TYPE_AUTH_METHOD_OIDC,
          state: 'foobar',
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('auth-method', '123abc');
    await model.changeState('foobar');
  });

  test('it has isPassword property and returns the expected values', function (assert) {
    const modelA = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_PASSWORD,
    });
    const modelB = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_OIDC,
    });
    const modelC = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_LDAP,
    });
    assert.true(modelA.isPassword);
    assert.false(modelB.isPassword);
    assert.false(modelC.isPassword);
  });

  test('it has isOIDC property and returns the expected values', function (assert) {
    const modelA = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_OIDC,
    });
    const modelB = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_PASSWORD,
    });
    const modelC = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_LDAP,
    });
    assert.true(modelA.isOIDC);
    assert.false(modelB.isOIDC);
    assert.false(modelC.isOIDC);
  });

  test('it has isLDAP property and returns the expected values', function (assert) {
    const modelA = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_LDAP,
    });
    const modelB = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_PASSWORD,
    });
    const modelC = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_OIDC,
    });
    assert.true(modelA.isLDAP);
    assert.false(modelB.isLDAP);
    assert.false(modelC.isLDAP);
  });

  test('it has isUnknown property and returns the expected values', function (assert) {
    const modelA = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_LDAP,
    });
    const modelB = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_PASSWORD,
    });
    const modelC = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_OIDC,
    });
    const modelD = store.createRecord('auth-method', {
      type: 'no-such-type',
    });
    assert.false(modelA.isUnknown);
    assert.false(modelB.isUnknown);
    assert.false(modelC.isUnknown);
    assert.true(modelD.isUnknown);
  });
});
