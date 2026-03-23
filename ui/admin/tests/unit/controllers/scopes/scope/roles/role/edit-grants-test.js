/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'admin/tests/helpers/mirage';
import { setupIntl } from 'ember-intl/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import sinon from 'sinon';

module(
  'Unit | Controller | scopes/scope/roles/role/edit-grants',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en-us');

    let store;
    let controller;
    let router;
    let replaceWithStub;

    const instances = {
      scopes: {
        global: null,
      },
      role: null,
    };
    hooks.beforeEach(async function () {
      store = this.owner.lookup('service:store');
      router = this.owner.lookup('service:router');
      replaceWithStub = sinon.stub(router, 'replaceWith');
      controller = this.owner.lookup(
        'controller:scopes/scope/roles/role/edit-grants',
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
      instances.role = this.server.create('role', {
        scope: instances.scopes.global,
      });
    });

    test('it exists', function (assert) {
      assert.ok(controller);
    });

    test('cancel action rolls-back changes on the specified model', async function (assert) {
      const role = await store.findRecord('role', instances.role.id);
      const originalGrantStrings = [...role.grant_strings];
      const updatedGrantStrings = [
        ...originalGrantStrings,
        'ids=*;type=*;actions=read',
      ];
      role.grant_strings = updatedGrantStrings;

      assert.notDeepEqual(role.grant_strings, originalGrantStrings);
      assert.deepEqual(role.grant_strings, updatedGrantStrings);

      await controller.cancel(role);

      assert.deepEqual(role.grant_strings, originalGrantStrings);
      assert.ok(
        replaceWithStub.calledOnceWith('scopes.scope.roles.role.grants'),
      );
    });

    test('save action saves grantStrings to specified model', async function (assert) {
      const role = await store.findRecord('role', instances.role.id);
      const grantStrings = role.grant_strings;
      const newGrantStrings = [...grantStrings, 'ids=*;type=*;actions=read'];

      await controller.save(role, newGrantStrings);

      assert.deepEqual(role.grant_strings, newGrantStrings);
    });
  },
);
