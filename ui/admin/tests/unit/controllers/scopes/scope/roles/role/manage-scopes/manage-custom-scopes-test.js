/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit, currentURL, waitUntil } from '@ember/test-helpers';
import { setupMirage } from 'api/test-support/helpers/mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Unit | Controller | scopes/scope/roles/role/manage-scopes/manage-custom-scopes',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupSqlite(hooks);

    let store;
    let controller;

    const instances = {
      scopes: {
        org: null,
      },
      role: null,
    };

    const urls = {
      globalScope: null,
      manageScopes: null,
      manageCustomScopes: null,
    };

    hooks.beforeEach(async function () {
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/roles/role/manage-scopes/manage-custom-scopes',
      );

      this.server.create('scope', { id: 'global' }, 'withGlobalAuth');
      await authenticateSession({
        isGlobal: true,
        account_id: this.server.schema.accounts.first().id,
      });
      instances.scopes.org = this.server.create('scope', {
        type: 'org',
        scope: { id: 'global', type: 'global' },
      });
      instances.role = this.server.create('role', {
        scopeId: 'global',
        grant_scope_ids: [],
      });

      urls.globalScope = `/scopes/global`;
      urls.manageScopes = `${urls.globalScope}/roles/${instances.role.id}/manage-scopes`;
      urls.manageCustomScopes = `${urls.manageScopes}/manage-custom-scopes`;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
      assert.ok(controller.manageScopes);
    });

    test('handleSearchInput action sets expected values correctly', async function (assert) {
      const searchValue = 'test';
      controller.handleSearchInput({ target: { value: searchValue } });
      await waitUntil(() => controller.search === searchValue);

      assert.strictEqual(controller.page, 1);
      assert.strictEqual(controller.search, searchValue);
    });

    test('setGrantScopes action adds scopes to specified model', async function (assert) {
      await visit(urls.manageCustomScopes);
      const role = await store.findRecord('role', instances.role.id);

      assert.deepEqual(role.grant_scope_ids, []);

      role.grant_scope_ids = [instances.scopes.org.id];
      await controller.setGrantScopes(role);

      assert.deepEqual(role.grant_scope_ids, [instances.scopes.org.id]);
    });

    test('cancel action rolls back changes causes transition to expected route', async function (assert) {
      await visit(urls.manageCustomScopes);
      const role = await store.findRecord('role', instances.role.id);

      assert.deepEqual(role.grant_scope_ids, []);

      role.grant_scope_ids = [instances.scopes.org.id];
      await controller.cancel(role);

      assert.deepEqual(role.grant_scope_ids, []);
      assert.strictEqual(currentURL(), urls.manageScopes);
    });
  },
);
