/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | storage-buckets | update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let features;

  const instances = {
    scopes: {
      global: null,
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
    instances.storageBucket = this.server.create('storage-bucket', {
      scope: instances.scopes.global,
    });
    instances.storageBucketMinio = this.server.create('storage-bucket', {
      scope: instances.scopes.global,
      plugin: { name: 'minio' },
    });
    urls.globalScope = `/scopes/global`;
    urls.storageBuckets = `${urls.globalScope}/storage-buckets`;
    urls.storageBucket = `${urls.storageBuckets}/${instances.storageBucket.id}`;
    urls.storageBucketMinio = `${urls.storageBuckets}/${instances.storageBucketMinio.id}`;

    features = this.owner.lookup('service:features');
    features.enable('ssh-session-recording');
    authenticateSession({});
  });

  test('can save changes to an existing storage-bucket', async function (assert) {
    await visit(urls.storageBuckets);

    await click(`[href="${urls.storageBucket}"]`);
    await click(commonSelectors.EDIT_BTN, 'Click edit mode');
    await fillIn(selectors.FIELD_NAME, selectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN, 'Click save');

    assert.dom(`[href="${urls.storageBucket}"]`).isVisible();
    assert.dom(selectors.FIELD_NAME).hasValue(selectors.FIELD_NAME_VALUE);
    assert.strictEqual(
      instances.storageBucket.name,
      selectors.FIELD_NAME_VALUE,
    );
  });

  test('can cancel changes to an existing storage-bucket', async function (assert) {
    const name = instances.storageBucket.name;
    await visit(urls.storageBuckets);

    await click(`[href="${urls.storageBucket}"]`);
    await click(commonSelectors.EDIT_BTN, 'Click edit mode');
    await fillIn(selectors.FIELD_NAME, selectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN, 'Click cancel');

    assert.dom(selectors.FIELD_NAME).hasValue(`${name}`);
    assert.strictEqual(instances.storageBucket.name, name);
  });

  test('can save changes to access key fields', async function (assert) {
    await visit(urls.storageBuckets);

    await click(`[href="${urls.storageBucket}"]`);
    assert.dom(selectors.FIELD_ACCESS_KEY_EDIT_BTN).exists();
    assert.dom(selectors.FIELD_SECRET_KEY_EDIT_BTN).exists();

    assert.dom(selectors.FIELD_ACCESS_KEY_EDIT_BTN).isDisabled();
    assert.dom(selectors.FIELD_SECRET_KEY_EDIT_BTN).isDisabled();

    await click(commonSelectors.EDIT_BTN, 'Click edit mode');

    assert.dom(selectors.FIELD_ACCESS_KEY_EDIT_BTN).isEnabled();
    assert.dom(selectors.FIELD_SECRET_KEY_EDIT_BTN).isEnabled();

    assert.dom(selectors.FIELD_ACCESS_KEY_EDIT_BTN).hasText('Edit');
    assert.dom(selectors.FIELD_SECRET_KEY_EDIT_BTN).hasText('Edit');

    await click(selectors.FIELD_ACCESS_KEY_EDIT_BTN);
    assert.dom(selectors.FIELD_ACCESS_KEY_EDIT_BTN).hasText('Cancel');
    await click(selectors.FIELD_SECRET_KEY_EDIT_BTN);
    assert.dom(selectors.FIELD_SECRET_KEY_EDIT_BTN).hasText('Cancel');

    await fillIn(selectors.FIELD_ACCESS_KEY, selectors.FIELD_ACCESS_KEY_VALUE);
    await fillIn(selectors.FIELD_SECRET_KEY, selectors.FIELD_SECRET_KEY_VALUE);

    await click(commonSelectors.SAVE_BTN, 'Click save');

    assert.dom(selectors.FIELD_ACCESS_KEY_EDIT_BTN).isDisabled();
    assert.dom(selectors.FIELD_SECRET_KEY_EDIT_BTN).isDisabled();

    assert.dom(selectors.FIELD_ACCESS_KEY).hasNoValue();
    assert.dom(selectors.FIELD_SECRET_KEY).hasNoValue();
  });

  test('can cancel changes to access key fields', async function (assert) {
    await visit(urls.storageBuckets);

    await click(`[href="${urls.storageBucket}"]`);
    await click(commonSelectors.EDIT_BTN, 'Click edit mode');
    await click(selectors.FIELD_ACCESS_KEY_EDIT_BTN);
    await click(selectors.FIELD_SECRET_KEY_EDIT_BTN);

    await fillIn(selectors.FIELD_ACCESS_KEY, selectors.FIELD_ACCESS_KEY_VALUE);
    await fillIn(selectors.FIELD_SECRET_KEY, selectors.FIELD_SECRET_KEY_VALUE);

    await click(selectors.FIELD_ACCESS_KEY_EDIT_BTN, 'Click cancel button');
    await click(selectors.FIELD_SECRET_KEY_EDIT_BTN, 'Click cancel button');

    await click(commonSelectors.SAVE_BTN, 'Click save');

    assert.dom(selectors.FIELD_ACCESS_KEY_EDIT_BTN).isDisabled();
    assert.dom(selectors.FIELD_SECRET_KEY_EDIT_BTN).isDisabled();

    assert.dom(selectors.FIELD_ACCESS_KEY).hasNoValue();
    assert.dom(selectors.FIELD_SECRET_KEY).hasNoValue();
  });

  test('saving an existing storage-bucket with invalid fields will display error messages', async function (assert) {
    await visit(urls.storageBuckets);
    this.server.patch('/storage-buckets/:id', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {
            request_fields: [
              {
                name: 'bucket_name',
                description: 'This is a required field.',
              },
              {
                name: 'worker_filter',
                description: 'Worker filter is required.',
              },
            ],
          },
        },
      );
    });

    await click(`[href="${urls.storageBucket}"]`);
    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(selectors.FIELD_WORKER_FILTER, 'random string');
    await click(commonSelectors.SAVE_BTN);

    assert.dom(selectors.TOAST).hasText('The request was invalid.');
    assert
      .dom(selectors.FIELD_BUCKET_NAME_ERROR)
      .hasText('This is a required field.');
    assert
      .dom(selectors.FIELD_WORKER_FILTER_ERROR)
      .hasText('Worker filter is required.');
  });

  test('user cannot edit scope, provider, bucket name, bucket prefix and region fields in a Amazon S3 storage bucket form', async function (assert) {
    await visit(urls.storageBuckets);

    await click(`[href="${urls.storageBucket}"]`);

    assert.dom(selectors.FIELD_BUCKET_NAME).isDisabled();
    assert.dom(selectors.FIELD_BUCKET_PREFIX).isDisabled();

    await click(commonSelectors.EDIT_BTN, 'Click edit mode');

    assert.dom(selectors.FIELD_SCOPE).doesNotExist();
    assert.dom(selectors.FIELD_PLUGIN_TYPE).isDisabled();
    assert.dom(selectors.FIELD_BUCKET_NAME).hasAttribute('readOnly');
    assert.dom(selectors.FIELD_BUCKET_PREFIX).hasAttribute('readOnly');
    assert.dom(selectors.FIELD_REGION).hasAttribute('readOnly');
    assert.dom(selectors.FIELD_BUCKET_NAME).isNotDisabled();
    assert.dom(selectors.FIELD_BUCKET_PREFIX).isNotDisabled();
    assert.dom(selectors.FIELD_REGION).isNotDisabled();
  });

  test('user cannot edit scope, provider, endpoint_url, bucket name or region fields in a MinIO storage bucket', async function (assert) {
    await visit(urls.storageBuckets);

    await click(`[href="${urls.storageBucketMinio}"]`);

    assert.dom(selectors.FIELD_BUCKET_NAME).isDisabled();

    await click(commonSelectors.EDIT_BTN, 'Click edit mode');

    assert.dom(selectors.FIELD_SCOPE).doesNotExist();
    assert.dom(selectors.FIELD_PLUGIN_TYPE).isDisabled();
    assert.dom(selectors.FIELD_ENDPOINT_URL).isNotDisabled();
    assert.dom(selectors.FIELD_BUCKET_NAME).hasAttribute('readOnly');
    assert.dom(selectors.FIELD_REGION).hasAttribute('readOnly');
  });
});
