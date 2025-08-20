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

module(
  'Unit | Controller | scopes/scope/groups/group/add-members',
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
      },
      group: null,
      user: null,
    };

    const urls = {
      globalScope: null,
      addMembers: null,
    };
    const model = {
      scopes: [{ id: 'global', type: 'global' }],
    };
    hooks.beforeEach(async function () {
      await authenticateSession({});
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/groups/group/add-members',
      );

      instances.scopes.global = this.server.create('scope', { id: 'global' });
      instances.scopes.org = this.server.create('scope', {
        type: 'org',
        scope: { id: 'global', type: 'global' },
      });
      instances.group = this.server.create('group', {
        scope: instances.scopes.global,
      });
      instances.user = this.server.create('user', {
        scope: instances.scopes.global,
      });

      urls.globalScope = `/scopes/global`;
      urls.addMembers = `${urls.globalScope}/groups/${instances.group.id}/add-members`;
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
      await visit(urls.addMembers);

      assert.deepEqual(controller.flatSortedScopes, [globalScope, orgScope]);
    });

    test('addMembers action adds users to specified model', async function (assert) {
      await visit(urls.addMembers);
      const group = await store.findRecord('group', instances.group.id);
      const user = await store.findRecord('user', instances.user.id);

      assert.deepEqual(group.members, []);

      await controller.addMembers(group, [instances.user.id]);

      assert.deepEqual(group.members, [user]);
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
