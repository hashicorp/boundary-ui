/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import { setupMirage } from 'admin/tests/helpers/mirage';
import { setupIntl } from 'ember-intl/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Unit | Controller | scopes/scope/storage-buckets/index',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en-us');

    let intl;
    let features;
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
      intl = this.owner.lookup('service:intl');
      features = this.owner.lookup('service:features');
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/storage-buckets/index',
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

    test('messageDescription returns correct translation with list authorization', async function (assert) {
      features.enable('ssh-session-recording');
      await visit(urls.storageBuckets);

      assert.strictEqual(
        controller.messageDescription,
        intl.t('resources.storage-bucket.messages.none.description'),
      );
    });

    test('messageDescription returns correct translation with create authorization', async function (assert) {
      features.enable('ssh-session-recording');
      instances.scopes.global.authorized_collection_actions['storage-buckets'] =
        ['create'];
      await visit(urls.storageBuckets);

      assert.strictEqual(
        controller.messageDescription,
        intl.t('descriptions.create-but-not-list', {
          resource: intl.t('resources.storage-bucket.title_plural'),
        }),
      );
    });

    test('messageDescription returns correct translation with no authorization', async function (assert) {
      features.enable('ssh-session-recording');
      instances.scopes.global.authorized_collection_actions['storage-buckets'] =
        [];
      await visit(urls.storageBuckets);

      assert.strictEqual(
        controller.messageDescription,
        intl.t('descriptions.neither-list-nor-create', {
          resource: intl.t('resources.storage-bucket.title_plural'),
        }),
      );
    });
  },
);
