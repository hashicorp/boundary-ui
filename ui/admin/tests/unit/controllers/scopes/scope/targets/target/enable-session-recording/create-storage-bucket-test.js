/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import { setupMirage } from 'admin/tests/helpers/mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Unit | Controller | scopes/scope/targets/target/enable-session-recording/create-storage-bucket',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupSqlite(hooks);

    let store;
    let controller;

    const instances = {
      scopes: {
        org: null,
        project: null,
      },
      target: null,
      storageBucket: null,
    };

    const urls = {
      projectScope: null,
      createStorageBucket: null,
    };

    hooks.beforeEach(async function () {
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/targets/target/enable-session-recording/create-storage-bucket',
      );

      this.server.create('scope', { id: 'global' }, 'withGlobalAuth');
      await authenticateSession({
        isGlobal: true,
        account_id: this.server.schema.accounts.first().id,
      });
      instances.scopes.org = this.server.create('scope', {
        type: 'org',
        scope: { id: 'global', type: 'global' },
      });
      instances.scopes.project = this.server.create('scope', {
        type: 'project',
        scope: { id: instances.scopes.org.id, type: 'org' },
      });
      instances.target = this.server.create('target', {
        scope: instances.scopes.project,
      });
      instances.storageBucket = this.server.create('storage-bucket', {
        scope: instances.scopes.org,
      });

      urls.projectScope = `/scopes/${instances.scopes.project.id}`;
      urls.createStorageBucket = `${urls.projectScope}/targets/${instances.target.id}/enable-session-recording`;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
      assert.ok(controller.storageBuckets);
    });

    test('cancel action rolls-back changes on the specified model', async function (assert) {
      await visit(urls.createStorageBucket);
      const storageBucket = await store.findRecord(
        'storage-bucket',
        instances.storageBucket.id,
      );
      storageBucket.name = 'test';

      assert.strictEqual(storageBucket.name, 'test');

      await controller.cancel(storageBucket);

      assert.notEqual(storageBucket.name, 'test');
    });

    test('save action saves changes on the specified model', async function (assert) {
      await visit(urls.createStorageBucket);
      const storageBucket = await store.findRecord(
        'storage-bucket',
        instances.storageBucket.id,
      );
      storageBucket.name = 'test';

      await controller.save(storageBucket);

      assert.strictEqual(storageBucket.name, 'test');
    });
  },
);
