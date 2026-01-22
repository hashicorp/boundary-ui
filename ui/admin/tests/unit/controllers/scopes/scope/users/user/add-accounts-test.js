/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import { setupMirage } from 'admin/tests/helpers/mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Unit | Controller | scopes/scope/users/user/add-accounts',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);

    let store;
    let controller;

    const instances = {
      scopes: {
        global: null,
      },
      user: null,
      account: null,
    };

    const urls = {
      globalScope: null,
      addAccounts: null,
    };

    hooks.beforeEach(async function () {
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/users/user/add-accounts',
      );

      instances.scopes.global = this.server.create(
        'scope',
        { id: 'global' },
        'withGlobalAuth',
      );
      await authenticateSession({
        isGlobal: true,
        account_id: this.server.schema.accounts.first().id,
      });
      instances.user = this.server.create('user', {
        scope: instances.scopes.global,
      });
      instances.account = this.server.create('account', {
        scope: instances.scopes.global,
      });

      urls.globalScope = `/scopes/global`;
      urls.addAccounts = `${urls.globalScope}/users/add-accounts`;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
    });

    test('addAccount action adds specified account to model', async function (assert) {
      await visit(urls.addAccounts);
      const user = await store.findRecord('user', instances.user.id);

      assert.deepEqual(user.account_ids, []);

      await controller.addAccounts(user, [instances.account.id]);

      assert.deepEqual(user.account_ids, [instances.account.id]);
    });
  },
);
