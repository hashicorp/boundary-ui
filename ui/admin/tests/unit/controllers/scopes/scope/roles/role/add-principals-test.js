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
  },
);
