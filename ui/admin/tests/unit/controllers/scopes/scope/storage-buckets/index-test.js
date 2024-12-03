/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { setupIntl } from 'ember-intl/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Unit | Controller | scopes/scope/storage-buckets/index',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupIndexedDb(hooks);
    setupIntl(hooks, 'en-us');

    let store;
    let controller;
    let getStorageBucketCount;

    const instances = {
      scopes: {
        global: null,
      },
      storageBucket: null,
    };

    const urls = {
      storageBuckets: null,
    };

    hooks.beforeEach(async function () {
      await authenticateSession({});
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/storage-buckets/index',
      );

      instances.scopes.global = this.server.create('scope', { id: 'global' });
      instances.storageBucket = this.server.create('storage-bucket', {
        scope: instances.scopes.global,
      });

      urls.storageBuckets = '/scopes/global/storage-buckets';

      getStorageBucketCount = () =>
        this.server.schema.storageBuckets.all().models.length;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
    });

    test('cancel action rolls-back changes on the specified model', async function (assert) {
      await visit(urls.storageBuckets);
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
      await visit(urls.storageBuckets);
      const storageBucket = await store.findRecord(
        'storage-bucket',
        instances.storageBucket.id,
      );
      storageBucket.name = 'test';

      await controller.save(storageBucket);

      assert.strictEqual(storageBucket.name, 'test');
    });

    test('delete action destroys specified model', async function (assert) {
      const storageBucket = await store.findRecord(
        'storage-bucket',
        instances.storageBucket.id,
      );
      const storageBucketCount = getStorageBucketCount();

      await controller.delete(storageBucket);

      assert.strictEqual(getStorageBucketCount(), storageBucketCount - 1);
    });
  },
);
