/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import { setupMirage } from 'admin/tests/helpers/mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { setupIntl } from 'ember-intl/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Unit | Controller | scopes/scope/index', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);
  setupIntl(hooks, 'en-us');

  let store;
  let controller;
  let getScopeCount;

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    policy: null,
  };

  const urls = {
    globalScope: null,
  };

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
    controller = this.owner.lookup('controller:scopes/scope/index');

    this.server.create('scope', { id: 'global' }, 'withGlobalAuth');
    await authenticateSession({
      isGlobal: true,
      account_id: this.server.schema.accounts.first().id,
    });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.policy = this.server.create('policy', {
      scope: instances.scopes.org,
    });

    urls.globalScope = `/scopes/global/scopes`;

    getScopeCount = () => this.server.schema.scopes.all().models.length;
  });

  test('it exists', function (assert) {
    assert.ok(controller);
  });

  test('cancel action rolls-back changes on the specified model', async function (assert) {
    await visit(urls.globalScope);
    const org = await store.findRecord('scope', instances.scopes.org.id);
    org.name = 'test';

    assert.strictEqual(org.name, 'test');

    await controller.cancel(org);

    assert.notEqual(org.name, 'test');
  });

  test('save action saves changes on the specified model', async function (assert) {
    await visit(urls.globalScope);
    const org = await store.findRecord('scope', instances.scopes.org.id);
    org.name = 'test';

    await controller.save(org);

    assert.strictEqual(org.name, 'test');
  });

  test('delete action destroys specified model', async function (assert) {
    const org = await store.findRecord('scope', instances.scopes.org.id);
    const scopeCount = getScopeCount();

    await controller.delete(org);

    assert.strictEqual(getScopeCount(), scopeCount - 1);
  });

  test('detachStoragePolicy action removes policy from model', async function (assert) {
    instances.scopes.org.update({ storage_policy_id: instances.policy.id });
    const org = await store.findRecord('scope', instances.scopes.org.id);

    assert.strictEqual(org.storage_policy_id, instances.policy.id);

    await controller.detachStoragePolicy(org);

    assert.notOk(org.storage_policy_id);
  });
});
