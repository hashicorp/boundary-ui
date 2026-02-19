/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import { setupMirage } from 'admin/tests/helpers/mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Unit | Controller | scopes/scope/roles/role/grants', function (hooks) {
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
    grants: null,
  };

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
    controller = this.owner.lookup('controller:scopes/scope/roles/role/grants');

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

    urls.grants = `/scopes/global/roles/${instances.role.id}/grants`;
  });

  test('it exists', function (assert) {
    assert.ok(controller);
    assert.ok(controller.roles);
  });

  test('cancel action rolls-back changes on the specified model', async function (assert) {
    await visit(urls.grants);
    const role = await store.findRecord('role', instances.role.id);
    const grantStrings = role.grant_strings;
    role.grant_strings = ['ids=*;type=*;actions=read'];

    assert.deepEqual(role.grant_strings, ['ids=*;type=*;actions=read']);

    await controller.cancel(role);

    assert.deepEqual(role.grant_strings, grantStrings);
  });

  test('save action saves grantStrings to specified model', async function (assert) {
    await visit(urls.grants);
    const role = await store.findRecord('role', instances.role.id);
    const grantStrings = role.grant_strings;
    const newGrantStrings = [...grantStrings, 'ids=*;type=*;actions=read'];

    await controller.save(role, newGrantStrings);

    assert.deepEqual(role.grant_strings, newGrantStrings);
  });

  test('removeGrant action removes a grant string from a role', async function (assert) {
    await visit(urls.grants);
    const role = await store.findRecord('role', instances.role.id);
    const grantStrings = role.grant_strings;

    await controller.removeGrant(role, grantStrings[0]);

    assert.deepEqual(role.grant_strings, grantStrings.slice(1));
  });

  test('addGrant action adds a grant string from a role', async function (assert) {
    await visit(urls.grants);
    const role = await store.findRecord('role', instances.role.id);
    const grantStrings = role.grant_strings;
    const grantString = 'ids=*;type=*;actions=read';

    await controller.addGrant(role, grantString);

    assert.deepEqual(role.grant_strings, [grantString, ...grantStrings]);
  });
});
