/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitUntil, visit } from '@ember/test-helpers';
import { setupMirage } from 'admin/tests/helpers/mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { setupIntl } from 'ember-intl/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Unit | Controller | scopes/scope/groups/index', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);
  setupIntl(hooks, 'en-us');

  let intl;
  let store;
  let controller;
  let getGroupCount;

  const instances = {
    scopes: {
      global: null,
    },
    group: null,
    user: null,
  };

  const urls = {
    groups: null,
  };

  hooks.beforeEach(async function () {
    intl = this.owner.lookup('service:intl');
    store = this.owner.lookup('service:store');
    controller = this.owner.lookup('controller:scopes/scope/groups/index');

    instances.scopes.global = this.server.create(
      'scope',
      { id: 'global' },
      'withGlobalAuth',
    );
    await authenticateSession({
      isGlobal: true,
      account_id: this.server.schema.accounts.first().id,
    });
    instances.group = this.server.create('group', {
      scope: instances.scopes.global,
    });
    instances.user = this.server.create('user', {
      scope: instances.scopes.global,
    });

    urls.groups = '/scopes/global/groups';

    getGroupCount = () => this.server.schema.groups.all().models.length;
  });

  test('it exists', function (assert) {
    assert.ok(controller);
  });

  test('handleSearchInput action sets expected values correctly', async function (assert) {
    const searchValue = 'group';
    controller.handleSearchInput({ target: { value: searchValue } });
    await waitUntil(() => controller.search === searchValue);

    assert.strictEqual(controller.page, 1);
    assert.strictEqual(controller.search, searchValue);
  });

  test('cancel action rolls-back changes on the specified model', async function (assert) {
    await visit(urls.groups);
    const group = await store.findRecord('group', instances.group.id);
    group.name = 'test';

    assert.strictEqual(group.name, 'test');

    await controller.cancel(group);

    assert.notEqual(group.name, 'test');
  });

  test('save action saves changes on the specified model', async function (assert) {
    await visit(urls.groups);
    const group = await store.findRecord('group', instances.group.id);
    group.name = 'test';

    await controller.save(group);

    assert.strictEqual(group.name, 'test');
  });

  test('delete action destroys specified model', async function (assert) {
    const group = await store.findRecord('group', instances.group.id);
    const groupCount = getGroupCount();

    await controller.delete(group);

    assert.strictEqual(getGroupCount(), groupCount - 1);
  });

  test('removeMember action removes member from group', async function (assert) {
    instances.group.update({ memberIds: [instances.user.id] });
    const group = await store.findRecord('group', instances.group.id);

    assert.deepEqual(group.member_ids, [instances.user.id]);

    await controller.removeMember(group, instances.user);

    assert.deepEqual(group.member_ids, []);
  });

  test('messageDescription returns correct translation with list authorization', async function (assert) {
    await visit(urls.groups);

    assert.strictEqual(
      controller.messageDescription,
      intl.t('resources.group.description'),
    );
  });

  test('messageDescription returns correct translation with create authorization', async function (assert) {
    instances.scopes.global.authorized_collection_actions.groups = ['create'];
    await visit(urls.groups);

    assert.strictEqual(
      controller.messageDescription,
      intl.t('descriptions.create-but-not-list', {
        resource: intl.t('resources.group.title_plural'),
      }),
    );
  });

  test('messageDescription returns correct translation with no authorization', async function (assert) {
    instances.scopes.global.authorized_collection_actions.groups = [];
    await visit(urls.groups);

    assert.strictEqual(
      controller.messageDescription,
      intl.t('descriptions.neither-list-nor-create', {
        resource: intl.t('resources.group.title_plural'),
      }),
    );
  });
});
