/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | storage-buckets | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let features;
  const STORAGE_BUCKET_LINK = 'Storage Buckets';

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
  };

  const urls = {
    globalScope: null,
    storageBuckets: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    urls.globalScope = `/scopes/global`;
    urls.storageBuckets = `${urls.globalScope}/storage-buckets`;

    features = this.owner.lookup('service:features');
    features.enable('session-recording');
    authenticateSession({});
  });

  test('users can navigate to storage-buckets with proper authorization', async function (assert) {
    assert.expect(3);

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
  });

  test('user cannot navigate to index without either list or create actions', async function (assert) {
    assert.expect(3);
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
      .doesNotIncludeText(STORAGE_BUCKET_LINK);
  });

  test('user can navigate to index with only create action', async function (assert) {
    assert.expect(3);
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
  });

  test('user can navigate to index with only list action', async function (assert) {
    assert.expect(3);
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
  });

  test('user cannot navigate to index when feature is disabled', async function (assert) {
    assert.expect(1);
    features.disable('session-recording');

    await visit(urls.globalScope);

    assert
      .dom('[title="General"] a:nth-of-type(2)')
      .doesNotIncludeText(STORAGE_BUCKET_LINK);
  });
});
