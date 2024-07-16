/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit, currentURL, waitUntil } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Unit | Controller | scopes/scope/roles/role/manage-scopes/manage-custom-scopes',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupIndexedDb(hooks);

    let store;
    let controller;

    const instances = {
      scopes: {
        global: null,
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
      authenticateSession({});
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/roles/role/manage-scopes/manage-custom-scopes',
      );

      instances.scopes.global = this.server.create('scope', { id: 'global' });
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

      await controller.setGrantScopes(role, [instances.scopes.org.id]);

      assert.deepEqual(role.grant_scope_ids, [instances.scopes.org.id]);
    });

    test('cancel action causes transition to expected route', async function (assert) {
      await visit(urls.manageCustomScopes);

      await controller.cancel();

      assert.strictEqual(currentURL(), urls.manageScopes);
    });
  },
);
