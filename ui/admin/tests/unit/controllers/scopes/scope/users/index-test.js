/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitUntil, visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Unit | Controller | scopes/scope/users/index', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let store;
  let controller;
  let getUserCount;

  const instances = {
    scopes: {
      global: null,
    },
    user: null,
    account: null,
  };

  const urls = {
    globalScope: null,
    users: null,
  };

  hooks.beforeEach(function () {
    authenticateSession({});
    store = this.owner.lookup('service:store');
    controller = this.owner.lookup('controller:scopes/scope/users/index');

    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.user = this.server.create('user', {
      scope: instances.scopes.global,
    });
    instances.account = this.server.create('account', {
      scope: instances.scopes.global,
    });

    urls.globalScope = `/scopes/global`;
    urls.users = `${urls.globalScope}/users`;

    getUserCount = () => this.server.schema.users.all().models.length;
  });

  test('it exists', function (assert) {
    assert.ok(controller);
  });

  test('handleSearchInput action sets expected values correctly', async function (assert) {
    const searchValue = 'test';
    controller.handleSearchInput({ target: { value: searchValue } });
    await waitUntil(() => controller.search === searchValue);

    assert.strictEqual(controller.page, 1);
    assert.strictEqual(controller.search, searchValue);
  });

  test('cancel action rolls-back changes on the specified model', async function (assert) {
    await visit(urls.users);
    const user = await store.findRecord('user', instances.user.id);
    user.name = 'test';

    assert.strictEqual(user.name, 'test');

    await controller.cancel(user);

    assert.notEqual(user.name, 'test');
  });

  test('save action saves changes on the specified model', async function (assert) {
    await visit(urls.users);
    const user = await store.findRecord('user', instances.user.id);
    user.name = 'test';

    await controller.save(user);

    assert.strictEqual(user.name, 'test');
  });

  test('delete action destroys specified model', async function (assert) {
    const user = await store.findRecord('user', instances.user.id);
    const userCount = getUserCount();

    await controller.delete(user);

    assert.strictEqual(getUserCount(), userCount - 1);
  });

  test('removeAccount action removes specified account from model', async function (assert) {
    const user = await store.findRecord('user', instances.user.id);
    await user.addAccounts([instances.account.id]);

    assert.deepEqual(user.account_ids, [instances.account.id]);

    await controller.removeAccount(user, instances.account);

    assert.deepEqual(user.account_ids, []);
  });
});
