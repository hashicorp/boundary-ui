/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Unit | Controller | scopes/scope/roles/role/add-principals',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);

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
      globalScope: null,
      addPrincipals: null,
    };

    hooks.beforeEach(async function () {
      authenticateSession({});
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/roles/role/add-principals',
      );

      instances.scopes.global = this.server.create('scope', { id: 'global' });
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

      urls.globalScope = `/scopes/global`;
      urls.addPrincipals = `${urls.globalScope}/roles/${instances.role.id}/add-principals`;
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

    test('callFilterBy action adds expected property values to route', async function (assert) {
      const route = this.owner.lookup(
        'route:scopes/scope/roles/role/add-principals',
      );
      await visit(urls.addPrincipals);
      const scope = await store.findRecord('scope', instances.scopes.global.id);

      assert.notOk(route.scope);

      controller.callFilterBy('scope', [scope]);

      assert.deepEqual(route.scope, [scope]);
    });

    test('callClearAllFilters action removes all filter values from route', async function (assert) {
      const route = this.owner.lookup(
        'route:scopes/scope/roles/role/add-principals',
      );
      await visit(urls.addPrincipals);
      const scope = await store.findRecord('scope', instances.scopes.global.id);
      route.scope = [scope];

      assert.deepEqual(route.scope, [scope]);

      controller.callClearAllFilters();

      assert.deepEqual(route.scope, []);
    });
  },
);
