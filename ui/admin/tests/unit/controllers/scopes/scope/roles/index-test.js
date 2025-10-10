/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitUntil, visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { setupIntl } from 'ember-intl/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Unit | Controller | scopes/scope/roles/index', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);
  setupIntl(hooks, 'en-us');

  let intl;
  let store;
  let controller;
  let getRoleCount;

  const instances = {
    scopes: {
      global: null,
    },
    role: null,
    user: null,
  };

  const urls = {
    globalScope: null,
    roles: null,
  };

  hooks.beforeEach(async function () {
    intl = this.owner.lookup('service:intl');
    store = this.owner.lookup('service:store');
    controller = this.owner.lookup('controller:scopes/scope/roles/index');

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
    instances.user = this.server.create('user', {
      scope: instances.scopes.global,
    });

    urls.globalScope = `/scopes/global`;
    urls.roles = `${urls.globalScope}/roles`;

    getRoleCount = () => this.server.schema.roles.all().models.length;
  });

  test('it exists', function (assert) {
    assert.ok(controller);
  });

  test('handleSearchInput action sets expected values correctly', async function (assert) {
    let controller = this.owner.lookup('controller:scopes/scope/roles/index');
    const searchValue = 'test';
    controller.handleSearchInput({ target: { value: searchValue } });
    await waitUntil(() => controller.search === searchValue);

    assert.strictEqual(controller.page, 1);
    assert.strictEqual(controller.search, searchValue);
  });

  test('cancel action rolls-back changes on the specified model', async function (assert) {
    await visit(urls.roles);
    const role = await store.findRecord('role', instances.role.id);
    role.name = 'test';

    assert.strictEqual(role.name, 'test');

    await controller.cancel(role);

    assert.notEqual(role.name, 'test');
  });

  test('save action saves changes on the specified model', async function (assert) {
    await visit(urls.roles);
    const role = await store.findRecord('role', instances.role.id);
    role.name = 'test';

    await controller.save(role);

    assert.strictEqual(role.name, 'test');
  });

  test('delete action destroys specified model', async function (assert) {
    const role = await store.findRecord('role', instances.role.id);
    const roleCount = getRoleCount();

    await controller.delete(role);

    assert.strictEqual(getRoleCount(), roleCount - 1);
  });

  test('removePrincipal action removes a principal from specified model', async function (assert) {
    const role = await store.findRecord('role', instances.role.id);
    await role.addPrincipals([instances.user.id]);

    assert.deepEqual(role.principals, [
      { id: instances.user.id, scope_id: instances.user.scopeId, type: 'user' },
    ]);

    await controller.removePrincipal(role, instances.user);

    assert.deepEqual(role.principals, []);
  });

  test('messageDescription returns correct translation with list authorization', async function (assert) {
    await visit(urls.roles);

    assert.strictEqual(
      controller.messageDescription,
      intl.t('resources.role.description'),
    );
  });

  test('messageDescription returns correct translation with create authorization', async function (assert) {
    instances.scopes.global.authorized_collection_actions.roles = ['create'];
    await visit(urls.roles);

    assert.strictEqual(
      controller.messageDescription,
      intl.t('descriptions.create-but-not-list', {
        resource: intl.t('resources.role.title_plural'),
      }),
    );
  });

  test('messageDescription returns correct translation with no authorization', async function (assert) {
    instances.scopes.global.authorized_collection_actions.roles = [];
    await visit(urls.roles);

    assert.strictEqual(
      controller.messageDescription,
      intl.t('descriptions.neither-list-nor-create', {
        resource: intl.t('resources.role.title_plural'),
      }),
    );
  });
});
