/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | storage-buckets | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let featuresService;
  let intl;

  const STORAGE_BUCKET_TITLE = 'Storage Buckets';
  const MESSAGE_DESCRIPTION_SELECTOR = '.rose-message-description';
  const MESSAGE_LINK_SELECTOR = '.rose-message-body .hds-link-standalone';
  const DROPDOWN_BUTTON_SELECTOR = '.hds-dropdown-toggle-icon';
  const DROPDOWN_ITEM_SELECTOR = '.hds-dropdown-list-item a';

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

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    urls.globalScope = `/scopes/global`;
    urls.storageBuckets = `${urls.globalScope}/storage-buckets`;

    intl = this.owner.lookup('service:intl');

    authenticateSession({});
    featuresService = this.owner.lookup('service:features');
  });

  test('users can navigate to storage-buckets with proper authorization', async function (assert) {
    assert.expect(5);
    featuresService.enable('session-recording');
    await visit(urls.globalScope);

    assert.true(
      instances.scopes.global.authorized_collection_actions[
        'storage-buckets'
      ].includes('list')
    );
    assert.true(
      instances.scopes.global.authorized_collection_actions[
        'storage-buckets'
      ].includes('create')
    );
    assert.dom(`[href="${urls.storageBuckets}"]`).exists();

    // Tests that correct message is displayed when no buckets exist
    await click(`[href="${urls.storageBuckets}"]`);

    assert
      .dom(MESSAGE_DESCRIPTION_SELECTOR)
      .hasText(intl.t('resources.storage-bucket.messages.none.description'));
    assert.dom(MESSAGE_LINK_SELECTOR).exists();
  });

  test('user cannot navigate to index without either list or create actions', async function (assert) {
    assert.expect(5);
    featuresService.enable('byow');
    featuresService.enable('session-recording');

    instances.scopes.global.authorized_collection_actions['storage-buckets'] =
      [];

    await visit(urls.globalScope);

    assert.false(
      instances.scopes.global.authorized_collection_actions[
        'storage-buckets'
      ].includes('list')
    );
    assert.false(
      instances.scopes.global.authorized_collection_actions[
        'storage-buckets'
      ].includes('create')
    );
    assert
      .dom('[title="General"] a:nth-of-type(3)')
      .doesNotIncludeText(STORAGE_BUCKET_TITLE);

    // Tests that correct message is displayed when no buckets exist
    await visit(urls.storageBuckets);

    assert.dom(MESSAGE_DESCRIPTION_SELECTOR).hasText(
      intl.t('descriptions.neither-list-nor-create', {
        resource: STORAGE_BUCKET_TITLE,
      })
    );
    assert.dom(MESSAGE_LINK_SELECTOR).doesNotExist();
  });

  test('user can navigate to index with only create action', async function (assert) {
    assert.expect(5);
    featuresService.enable('session-recording');

    instances.scopes.global.authorized_collection_actions['storage-buckets'] =
      instances.scopes.global.authorized_collection_actions[
        'storage-buckets'
      ].filter((item) => item !== 'list');

    await visit(urls.globalScope);

    assert.false(
      instances.scopes.global.authorized_collection_actions[
        'storage-buckets'
      ].includes('list')
    );
    assert.true(
      instances.scopes.global.authorized_collection_actions[
        'storage-buckets'
      ].includes('create')
    );
    assert.dom(`[href="${urls.storageBuckets}"]`).exists();

    // Tests that correct message is displayed when no buckets exist
    await click(`[href="${urls.storageBuckets}"]`);

    assert.dom(MESSAGE_DESCRIPTION_SELECTOR).hasText(
      intl.t('descriptions.create-but-not-list', {
        resource: STORAGE_BUCKET_TITLE,
      })
    );
    assert.dom(MESSAGE_LINK_SELECTOR).exists();
  });

  test('user can navigate to index with only list action', async function (assert) {
    assert.expect(5);
    featuresService.enable('session-recording');

    instances.scopes.global.authorized_collection_actions['storage-buckets'] =
      instances.scopes.global.authorized_collection_actions[
        'storage-buckets'
      ].filter((item) => item !== 'create');

    await visit(urls.globalScope);

    assert.true(
      instances.scopes.global.authorized_collection_actions[
        'storage-buckets'
      ].includes('list')
    );
    assert.false(
      instances.scopes.global.authorized_collection_actions[
        'storage-buckets'
      ].includes('create')
    );
    assert.dom(`[href="${urls.storageBuckets}"]`).exists();

    // Tests that correct message is displayed when no buckets exist
    await click(`[href="${urls.storageBuckets}"]`);

    assert
      .dom(MESSAGE_DESCRIPTION_SELECTOR)
      .hasText(intl.t('resources.storage-bucket.messages.none.description'));
    assert.dom(MESSAGE_LINK_SELECTOR).doesNotExist();
  });

  test('user cannot navigate to index when feature is disabled', async function (assert) {
    assert.expect(2);
    featuresService.enable('byow');
    await visit(urls.globalScope);
    assert.false(featuresService.isEnabled('session-recording'));
    assert
      .dom('[title="General"] a:nth-of-type(2)')
      .doesNotIncludeText(STORAGE_BUCKET_TITLE);
  });

  test('edit action in table directs user to appropriate page', async function (assert) {
    assert.expect(3);
    featuresService.enable('session-recording');
    await visit(urls.globalScope);
    instances.storageBucket = this.server.create('storage-bucket', {
      scope: instances.scopes.global,
    });
    urls.storageBucket = `${urls.storageBuckets}/${instances.storageBucket.id}`;

    await click(`[href="${urls.storageBuckets}"]`);
    await click(DROPDOWN_BUTTON_SELECTOR);

    assert.dom(DROPDOWN_ITEM_SELECTOR).exists();
    assert.dom(DROPDOWN_ITEM_SELECTOR).hasText('Edit');
    await click(DROPDOWN_ITEM_SELECTOR);
    assert.strictEqual(currentURL(), urls.storageBucket);
  });
});
