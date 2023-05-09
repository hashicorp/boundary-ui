/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import {
  TYPE_AUTH_METHOD_PASSWORD,
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
} from 'api/models/auth-method';

module('Unit | Model | auth method', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('auth-method', {});
    assert.ok(model);
  });

  test('it has a `changeState` method that targets a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post(
      '/v1/auth-methods/123abc:change-state',
      (schema, request) => {
        const body = JSON.parse(request.requestBody);
        assert.deepEqual(body, {
          attributes: {
            state: 'foobar',
          },
          version: 1,
        });
        return { id: '123abc' };
      }
    );
    const store = this.owner.lookup('service:store');
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

  test('it has isPassword property and returns the expected values', async function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_PASSWORD,
    });
    const modelB = store.createRecord('auth-method', {
      type: 'no-such-type',
    });
    assert.true(modelA.isPassword);
    assert.false(modelB.isPassword);
  });

  test('it has isOIDC property and returns the expected values', async function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_OIDC,
    });
    const modelB = store.createRecord('auth-method', {
      type: 'no-such-type',
    });
    assert.true(modelA.isOIDC);
    assert.false(modelB.isOIDC);
  });

  test('it has isLDAP property and returns the expected values', async function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_LDAP,
    });
    const modelB = store.createRecord('auth-method', {
      type: 'no-such-type',
    });
    assert.true(modelA.isLDAP);
    assert.false(modelB.isLDAP);
  });
});
