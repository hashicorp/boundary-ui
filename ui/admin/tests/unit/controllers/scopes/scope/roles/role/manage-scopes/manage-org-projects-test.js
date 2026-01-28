/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { currentURL, visit, waitUntil } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Unit | Controller | scopes/scope/roles/role/manage-scopes/manage-org-projects',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupSqlite(hooks);

    let store;
    let controller;

    const instances = {
      scopes: {
        global: null,
        org: null,
        project: null,
      },
      role: null,
    };

    const urls = {
      globalScope: null,
      manageOrgProjects: null,
      manageCustomScopes: null,
    };

    hooks.beforeEach(async function () {
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/roles/role/manage-scopes/manage-org-projects',
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
      instances.scopes.org = this.server.create('scope', {
        type: 'org',
        scope: { id: 'global', type: 'global' },
      });
      instances.scopes.project = this.server.create('scope', {
        type: 'project',
        scope: { id: instances.scopes.org.id, type: 'org' },
      });
      instances.role = this.server.create('role', {
        scope: instances.scopes.global,
        grant_scope_ids: [],
      });

      urls.globalScope = `/scopes/global`;
      urls.manageOrgProjects = `${urls.globalScope}/roles/${instances.role.id}/manage-scopes/${instances.scopes.org.id}`;
      urls.manageCustomScopes = `${urls.globalScope}/roles/${instances.role.id}/manage-scopes/manage-custom-scopes`;
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
      await visit(urls.manageOrgProjects);
      const role = await store.findRecord('role', instances.role.id);

      assert.deepEqual(role.grant_scope_ids, []);

      role.grant_scope_ids = [instances.scopes.project.id];
      await controller.setGrantScopes(role);
      await waitUntil(() => currentURL() === urls.manageCustomScopes);

      assert.deepEqual(role.grant_scope_ids, [instances.scopes.project.id]);
      assert.strictEqual(currentURL(), urls.manageCustomScopes);
    });

    test('cancel action rolls back changes causes transition to expected route', async function (assert) {
      await visit(urls.manageOrgProjects);
      const role = await store.findRecord('role', instances.role.id);

      assert.deepEqual(role.grant_scope_ids, []);

      role.grant_scope_ids = [instances.scopes.project.id];
      await controller.cancel(role);
      await waitUntil(() => currentURL() === urls.manageCustomScopes);

      assert.deepEqual(role.grant_scope_ids, []);
      assert.strictEqual(currentURL(), urls.manageCustomScopes);
    });
  },
);
