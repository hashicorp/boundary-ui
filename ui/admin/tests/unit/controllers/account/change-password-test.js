/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { TYPE_AUTH_METHOD_PASSWORD } from 'api/models/auth-method';

module('Unit | Controller | account/change-password', function (hooks) {
  setupTest(hooks);
  // `setupSqlite` had to be moved before `setupMirage` or else the db object would
  // be destroyed before route query requests had a chance to run.
  setupSqlite(hooks);
  setupMirage(hooks);

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
    controller = this.owner.lookup('controller:account/change-password');
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
  });

  test('changePassword action makes the correct API call with correct values', async function (assert) {
    assert.expect(2);
    const password = 'current password';
    const newPassword = 'new password';
    this.server.post(
      '/accounts/:idMethod',
      (_, { params: { idMethod }, requestBody }) => {
        const attrs = JSON.parse(requestBody);
        assert.strictEqual(attrs.current_password, password);
        assert.strictEqual(attrs.new_password, newPassword);
        const id = idMethod.split(':')[0];
        return { id };
      },
    );
    await visit(urls.globalScope);
    const account = await store.findRecord('account', instances.account.id);

    await controller.changePassword(account, password, newPassword);
  });
});
