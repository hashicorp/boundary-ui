/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';
import { visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Unit | Controller | scopes/scope/roles/role/add-grant-templates',
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
      role: null,
    };

    const urls = {
      addGrantTemplates: null,
    };

    hooks.beforeEach(async function () {
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/roles/role/add-grant-templates',
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
      instances.role = this.server.create('role', {
        scope: instances.scopes.org,
        grant_strings: ['ids=*;type=user;actions=read'],
      });

      urls.addGrantTemplates = `/scopes/${instances.scopes.org.id}/roles/${instances.role.id}/add-grant-templates`;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
    });

    test('addGrantTemplates action adds grant templates to role and navigates', async function (assert) {
      await visit(urls.addGrantTemplates);
      const role = await store.findRecord('role', instances.role.id);

      const newGrantTemplates = [
        'ids=*;type=*;actions=*',
        'ids=*;type=session;actions=list,read',
      ];

      await controller.addGrantTemplates(role, newGrantTemplates);

      assert.deepEqual(role.grant_strings, [
        'ids=*;type=user;actions=read',
        'ids=*;type=*;actions=*',
        'ids=*;type=session;actions=list,read',
      ]);
    });
  },
);
