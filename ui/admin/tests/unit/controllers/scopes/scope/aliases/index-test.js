/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit, waitUntil } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { setupIntl } from 'ember-intl/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Unit | Controller | scopes/scope/aliases/index', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);
  setupSqlite(hooks);
  setupIntl(hooks, 'en-us');

  let intl;
  let store;
  let controller;
  let getAliasCount;

  const instances = {
    scopes: {
      global: null,
    },
    alias: null,
  };

  const urls = {
    globalScope: null,
    aliases: null,
  };

  hooks.beforeEach(async function () {
    await authenticateSession({});
    intl = this.owner.lookup('service:intl');
    store = this.owner.lookup('service:store');
    controller = this.owner.lookup('controller:scopes/scope/aliases/index');

    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.alias = this.server.create('alias', {
      scope: instances.scopes.global,
    });

    urls.globalScope = `/scopes/global`;
    urls.aliases = `${urls.globalScope}/aliases`;

    getAliasCount = () => this.server.schema.aliases.all().models.length;
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
    await visit(urls.aliases);
    const alias = await store.findRecord('alias', instances.alias.id);
    alias.name = 'test';

    assert.strictEqual(alias.name, 'test');

    await controller.cancel(alias);

    assert.notEqual(alias.name, 'test');
  });

  test('save action saves changes on the specified model', async function (assert) {
    await visit(urls.aliases);
    const alias = await store.findRecord('alias', instances.alias.id);
    alias.name = 'test';

    await controller.save(alias);

    assert.strictEqual(alias.name, 'test');
  });

  test('deleteAlias action destroys specified model', async function (assert) {
    const alias = await store.findRecord('alias', instances.alias.id);
    const aliasCount = getAliasCount();

    await controller.deleteAlias(alias);

    assert.strictEqual(getAliasCount(), aliasCount - 1);
  });

  test('clearAlias action removes destination_id on the specified model', async function (assert) {
    const targetId = 't_1234567';
    instances.alias.update({ destination_id: targetId });
    const alias = await store.findRecord('alias', instances.alias.id);
    assert.strictEqual(alias.destination_id, targetId);

    await controller.clearAlias(alias);

    assert.notOk(alias.destination_id);
  });

  test('messageDescription returns correct translation with list authorization', async function (assert) {
    await visit(urls.aliases);

    assert.strictEqual(
      controller.messageDescription,
      intl.t('resources.alias.messages.none.description'),
    );
  });

  test('messageDescription returns correct translation with create authorization', async function (assert) {
    instances.scopes.global.authorized_collection_actions.aliases = ['create'];
    await visit(urls.aliases);

    assert.strictEqual(
      controller.messageDescription,
      intl.t('descriptions.create-but-not-list', {
        resource: intl.t('resources.alias.title_plural'),
      }),
    );
  });

  test('messageDescription returns correct translation with no authorization', async function (assert) {
    instances.scopes.global.authorized_collection_actions.aliases = [];
    await visit(urls.aliases);

    assert.strictEqual(
      controller.messageDescription,
      intl.t('descriptions.neither-list-nor-create', {
        resource: intl.t('resources.alias.title_plural'),
      }),
    );
  });
});
