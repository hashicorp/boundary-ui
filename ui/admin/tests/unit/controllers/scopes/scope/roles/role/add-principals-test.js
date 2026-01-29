/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Unit | Controller | scopes/scope/roles/role/add-principals',
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
      user: null,
    };

    const urls = {
      addPrincipals: null,
    };
    const model = {
      scopes: [{ id: 'global', type: 'global' }],
    };

    hooks.beforeEach(async function () {
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/roles/role/add-principals',
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
        scopeId: 'global',
      });
      instances.user = this.server.create('user', {
        scopeId: 'global',
      });

      urls.addPrincipals = `/scopes/global/roles/${instances.role.id}/add-principals`;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
    });

    test('flatSortedScopes returns array of sorted scopes', async function (assert) {
      const globalScope = await store.findRecord(
        'scope',
        instances.scopes.global.id,
      );
      const orgScope = await store.findRecord('scope', instances.scopes.org.id);
      const projectScope = await store.findRecord(
        'scope',
        instances.scopes.project.id,
      );
      await visit(urls.addPrincipals);

      assert.deepEqual(controller.flatSortedScopes, [
        globalScope,
        orgScope,
        projectScope,
      ]);
    });

    test('addPrincipals action adds principals to specified model', async function (assert) {
      await visit(urls.addPrincipals);
      const role = await store.findRecord('role', instances.role.id);

      assert.deepEqual(role.principals, []);

      await controller.addPrincipals(role, [instances.user.id]);

      assert.deepEqual(role.principals, [
        {
          id: instances.user.id,
          scope_id: instances.user.scopeId,
          type: 'user',
        },
      ]);
    });

    test('applyFilter action sets expected values correctly', async function (assert) {
      controller.set('model', model);
      const selectedItems = ['yes'];
      controller.applyFilter('scopeIds', selectedItems);

      assert.deepEqual(controller.scopeIds, selectedItems);
    });

    test('filters returns expected entries', function (assert) {
      controller.set('model', model);

      assert.ok(controller.filters.allFilters);
      assert.ok(controller.filters.selectedFilters);
    });
  },
);
