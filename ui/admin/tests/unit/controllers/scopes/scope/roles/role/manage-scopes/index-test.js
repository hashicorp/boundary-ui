/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit, currentURL } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Unit | Controller | scopes/scope/roles/role/manage-scopes/index',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);

    let store;
    let controller;

    const instances = {
      scopes: {
        global: null,
      },
      role: null,
    };

    const urls = {
      globalScope: null,
      scopes: null,
      manageScopes: null,
    };

    hooks.beforeEach(async function () {
      authenticateSession({});
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/roles/role/manage-scopes/index',
      );

      instances.scopes.global = this.server.create('scope', { id: 'global' });
      instances.role = this.server.create('role', {
        scopeId: 'global',
        grant_scope_ids: [],
      });

      urls.globalScope = `/scopes/global`;
      urls.scopes = `${urls.globalScope}/roles/${instances.role.id}/scopes`;
      urls.manageScopes = `${urls.globalScope}/roles/${instances.role.id}/manage-scopes`;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
    });

    test('setGrantScopes action adds scopes to specified model', async function (assert) {
      await visit(urls.manageScopes);
      const role = await store.findRecord('role', instances.role.id);

      assert.deepEqual(role.grant_scope_ids, []);

      await controller.setGrantScopes(role, ['this']);

      assert.deepEqual(role.grant_scope_ids, ['this']);
    });

    test('cancel action causes transition to expected route', async function (assert) {
      await visit(urls.manageScopes);

      await controller.cancel();

      assert.strictEqual(currentURL(), urls.scopes);
    });
  },
);
