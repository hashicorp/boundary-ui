/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | storage-buckets | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);
  setupSqlite(hooks);

  let featuresService;
  let intl;

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    storageBucket: null,
  };

  const urls = {
    globalScope: null,
    storageBuckets: null,
    storageBucket: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    urls.globalScope = `/scopes/global`;
    urls.storageBuckets = `${urls.globalScope}/storage-buckets`;

    intl = this.owner.lookup('service:intl');

    await authenticateSession({});
    featuresService = this.owner.lookup('service:features');
  });

  test('users can navigate to storage-buckets with proper authorization', async function (assert) {
    featuresService.enable('ssh-session-recording');
    await visit(urls.globalScope);

    assert.true(
      instances.scopes.global.authorized_collection_actions[
        'storage-buckets'
      ].includes('list'),
    );
    assert.true(
      instances.scopes.global.authorized_collection_actions[
        'storage-buckets'
      ].includes('create'),
    );
    assert.dom(commonSelectors.HREF(urls.storageBuckets)).exists();

    // Tests that correct message is displayed when no buckets exist
    await click(commonSelectors.HREF(urls.storageBuckets));

    assert
      .dom(commonSelectors.PAGE_MESSAGE_DESCRIPTION)
      .hasText(intl.t('resources.storage-bucket.messages.none.description'));
    assert.dom(commonSelectors.PAGE_MESSAGE_LINK).exists();
  });

  test('user cannot navigate to index without either list or create actions', async function (assert) {
    featuresService.enable('byow');
    featuresService.enable('ssh-session-recording');

    instances.scopes.global.authorized_collection_actions['storage-buckets'] =
      [];

    await visit(urls.globalScope);

    assert.false(
      instances.scopes.global.authorized_collection_actions[
        'storage-buckets'
      ].includes('list'),
    );
    assert.false(
      instances.scopes.global.authorized_collection_actions[
        'storage-buckets'
      ].includes('create'),
    );
    assert
      .dom(commonSelectors.SIDEBAR_NAV_LINK(urls.storageBuckets))
      .doesNotExist();

    // Tests that correct message is displayed when no buckets exist
    await visit(urls.storageBuckets);

    assert.dom(commonSelectors.PAGE_MESSAGE_DESCRIPTION).hasText(
      intl.t('descriptions.neither-list-nor-create', {
        resource: selectors.STORAGE_BUCKET_TITLE,
      }),
    );
    assert.dom(commonSelectors.PAGE_MESSAGE_LINK).doesNotExist();
  });

  test('user can navigate to index with only create action', async function (assert) {
    featuresService.enable('ssh-session-recording');

    instances.scopes.global.authorized_collection_actions['storage-buckets'] =
      instances.scopes.global.authorized_collection_actions[
        'storage-buckets'
      ].filter((item) => item !== 'list');

    await visit(urls.globalScope);

    assert.false(
      instances.scopes.global.authorized_collection_actions[
        'storage-buckets'
      ].includes('list'),
    );
    assert.true(
      instances.scopes.global.authorized_collection_actions[
        'storage-buckets'
      ].includes('create'),
    );
    assert.dom(commonSelectors.HREF(urls.storageBuckets)).exists();

    // Tests that correct message is displayed when no buckets exist
    await click(commonSelectors.HREF(urls.storageBuckets));

    assert.dom(commonSelectors.PAGE_MESSAGE_DESCRIPTION).hasText(
      intl.t('descriptions.create-but-not-list', {
        resource: selectors.STORAGE_BUCKET_TITLE,
      }),
    );
    assert.dom(commonSelectors.PAGE_MESSAGE_LINK).exists();
  });

  test('user can navigate to index with only list action', async function (assert) {
    featuresService.enable('ssh-session-recording');

    instances.scopes.global.authorized_collection_actions['storage-buckets'] =
      instances.scopes.global.authorized_collection_actions[
        'storage-buckets'
      ].filter((item) => item !== 'create');

    await visit(urls.globalScope);

    assert.true(
      instances.scopes.global.authorized_collection_actions[
        'storage-buckets'
      ].includes('list'),
    );
    assert.false(
      instances.scopes.global.authorized_collection_actions[
        'storage-buckets'
      ].includes('create'),
    );
    assert.dom(commonSelectors.HREF(urls.storageBuckets)).exists();

    // Tests that correct message is displayed when no buckets exist
    await click(commonSelectors.HREF(urls.storageBuckets));

    assert
      .dom(commonSelectors.PAGE_MESSAGE_DESCRIPTION)
      .hasText(intl.t('resources.storage-bucket.messages.none.description'));
    assert.dom(commonSelectors.PAGE_MESSAGE_LINK).doesNotExist();
  });

  test('user cannot navigate to index when feature is disabled', async function (assert) {
    featuresService.enable('byow');
    await visit(urls.globalScope);
    assert.false(featuresService.isEnabled('ssh-session-recording'));
    assert
      .dom(commonSelectors.SIDEBAR_NAV_LINK(urls.storageBuckets))
      .doesNotExist();
  });

  test('edit action in table directs user to appropriate page', async function (assert) {
    featuresService.enable('ssh-session-recording');
    await visit(urls.globalScope);
    instances.storageBucket = this.server.create('storage-bucket', {
      scope: instances.scopes.global,
    });
    urls.storageBucket = `${urls.storageBuckets}/${instances.storageBucket.id}`;

    await click(commonSelectors.HREF(urls.storageBuckets));
    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);

    assert.dom(selectors.TABLE_FIRST_ROW_ACTION_FIRST_ITEM).exists();
    assert.dom(selectors.TABLE_FIRST_ROW_ACTION_FIRST_ITEM).hasText('Edit');
    await click(selectors.TABLE_FIRST_ROW_ACTION_FIRST_ITEM);
    assert.strictEqual(currentURL(), urls.storageBucket);
  });
});
