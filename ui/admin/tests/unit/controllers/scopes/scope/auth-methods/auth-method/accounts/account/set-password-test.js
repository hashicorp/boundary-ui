/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import { setupMirage } from 'api/test-support/helpers/mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { TYPE_AUTH_METHOD_PASSWORD } from 'api/models/auth-method';

module(
  'Unit | Controller | scopes/scope/auth-methods/auth-method/accounts/account/set-password',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupSqlite(hooks);

    let controller;
    let store;

    const instances = {
      scopes: {
        global: null,
      },
      authMethod: null,
      account: null,
    };

    const urls = {
      globalScope: null,
    };

    hooks.beforeEach(async function () {
      await authenticateSession({});
      controller = this.owner.lookup(
        'controller:scopes/scope/auth-methods/auth-method/accounts/account/set-password',
      );
      store = this.owner.lookup('service:store');

      instances.scopes.global = this.server.create('scope', {
        id: 'global',
        type: 'global',
      });
      instances.authMethod = this.server.create('auth-method', {
        scope: instances.scopes.global,
        type: TYPE_AUTH_METHOD_PASSWORD,
      });
      instances.account = this.server.create('account', {
        scope: instances.scopes.global,
        authMethod: instances.authMethod,
      });

      urls.globalScope = `/scopes/global`;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
      assert.ok(controller.accounts);
    });

    test('setPassword action makes the correct API call with correct values', async function (assert) {
      assert.expect(1);
      const password = 'current password';
      this.server.post(
        '/accounts/:idMethod',
        (_, { params: { idMethod }, requestBody }) => {
          const attrs = JSON.parse(requestBody);
          assert.strictEqual(attrs.password, password);
          const id = idMethod.split(':')[0];
          return { id };
        },
      );
      await visit(urls.globalScope);
      const account = await store.findRecord('account', instances.account.id);

      await controller.setPassword(account, password);
    });
  },
);
