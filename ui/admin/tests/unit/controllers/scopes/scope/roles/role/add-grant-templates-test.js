/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import sinon from 'sinon';

module(
  'Unit | Controller | scopes/scope/roles/role/add-grant-templates',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupSqlite(hooks);

    let store;
    let controller;
    let router;
    let routerStub;

    const instances = {
      scopes: {
        global: null,
        org: null,
      },
      role: null,
    };

    hooks.beforeEach(async function () {
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/roles/role/add-grant-templates',
      );
      router = this.owner.lookup('service:router');
      routerStub = sinon.stub(router, 'replaceWith');

      instances.scopes.global = this.server.create(
        'scope',
        { id: 'global' },
        'withGlobalAuth',
      );
      instances.scopes.org = this.server.create('scope', {
        type: 'org',
        scope: { id: 'global', type: 'global' },
      });
      instances.role = this.server.create('role', {
        scope: instances.scopes.org,
        grant_strings: ['ids=*;type=user;actions=read'],
      });
    });

    test('it exists', function (assert) {
      assert.ok(controller);
    });

    test('addGrantTemplates action adds grant templates to role', async function (assert) {
      const role = await store.findRecord('role', instances.role.id);

      const newGrantTemplates = [
        'ids=*;type=*;actions=*',
        'ids=*;type=session;actions=list,read',
      ];

      await controller.addGrantTemplates(role, newGrantTemplates);

      assert.ok(routerStub.calledOnceWith('scopes.scope.roles.role.grants'));
      assert.deepEqual(role.grant_strings, [
        'ids=*;type=user;actions=read',
        'ids=*;type=*;actions=*',
        'ids=*;type=session;actions=list,read',
      ]);
    });
  },
);
