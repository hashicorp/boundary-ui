/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Model | user', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it has an `addAccounts` method that users a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post('/users/123abc:add-accounts', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        account_ids: ['123_abc', 'foobar'],
        version: 1,
      });
      return { id: '123abc' };
    });
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'user',
        attributes: {
          name: 'User',
          description: 'Description',
          account_ids: ['1', '2'],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('user', '123abc');
    await model.addAccounts(['123_abc', 'foobar']);
  });

  test('it has a `removeAccounts` method that users a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post('/users/123abc:remove-accounts', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        account_ids: ['1', '3'],
        version: 1,
      });
      return { id: '123abc' };
    });
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'user',
        attributes: {
          name: 'user',
          description: 'Description',
          account_ids: ['4', '5'],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('user', '123abc');
    await model.removeAccounts(['1', '3']);
  });

  test('it has a `removeAccount` method that deletes a single account set using `removeAccounts` method', async function (assert) {
    assert.expect(1);
    this.server.post('/users/123abc:remove-accounts', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        account_ids: ['3'],
        version: 1,
      });
      return { id: '123abc' };
    });
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'user',
        attributes: {
          name: 'user',
          description: 'Description',
          account_ids: ['1', '3'],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('user', '123abc');
    await model.removeAccount('3');
  });

  test('it defaults `accounts_ids` to an empty array when model instance does not define it', function (assert) {
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: 'user_123',
        type: 'user',
      },
    });
    const user = store.peekRecord('user', 'user_123');
    assert.strictEqual(
      user.account_ids.length,
      0,
      'User has empty account_ids by default',
    );
  });

  test('it defaults to null for readonly attributes when response does not have fields', async function (assert) {
    assert.expect(3);
    this.server.post('/users/123abc:remove-accounts', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        account_ids: ['3'],
        version: 1,
      });
      return { id: '123abc', name: 'newName' };
    });
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'user',
        attributes: {
          name: 'user',
          description: 'Description',
          account_ids: ['3'],
          version: 1,
          login_name: 'zed',
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('user', '123abc');
    await model.removeAccount('3');

    assert.strictEqual(model.login_name, null);
    assert.strictEqual(model.name, 'newName');
  });
});
