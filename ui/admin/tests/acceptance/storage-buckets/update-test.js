/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
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
    storageBucketMinio: null,
  };

  const urls = {
    storageBuckets: null,
    storageBucket: null,
    storageBucketMinio: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.storageBucket = this.server.create('storage-bucket', {
      scope: instances.scopes.global,
    });
    instances.storageBucketMinio = this.server.create('storage-bucket', {
      scope: instances.scopes.global,
      plugin: { name: 'minio' },
    });
    urls.storageBuckets = `/scopes/global/storage-buckets`;
    urls.storageBucket = `${urls.storageBuckets}/${instances.storageBucket.id}`;
    urls.storageBucketMinio = `${urls.storageBuckets}/${instances.storageBucketMinio.id}`;

    features = this.owner.lookup('service:features');
    features.enable('ssh-session-recording');
  });

  test('can save changes to an existing storage-bucket', async function (assert) {
    await visit(urls.storageBuckets);

    await click(commonSelectors.HREF(urls.storageBucket));
    await click(commonSelectors.EDIT_BTN, 'Click edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN, 'Click save');

    assert.dom(`[href="${urls.storageBucket}"]`).isVisible();
    assert
      .dom(commonSelectors.FIELD_NAME)
      .hasValue(commonSelectors.FIELD_NAME_VALUE);
    assert.strictEqual(
      instances.storageBucket.name,
      commonSelectors.FIELD_NAME_VALUE,
    );
  });

  test('can cancel changes to an existing storage-bucket', async function (assert) {
    const name = instances.storageBucket.name;
    await visit(urls.storageBuckets);

    await click(commonSelectors.HREF(urls.storageBucket));
    await click(commonSelectors.EDIT_BTN, 'Click edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN, 'Click cancel');

    assert.dom(commonSelectors.FIELD_NAME).hasValue(`${name}`);
    assert.strictEqual(instances.storageBucket.name, name);
  });

  test('can save changes to access key fields', async function (assert) {
    await visit(urls.storageBuckets);

    await click(commonSelectors.HREF(urls.storageBucket));
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

    await click(commonSelectors.HREF(urls.storageBucket));
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
    await fillIn(
      commonSelectors.CODE_EDITOR_CONTENT,
      selectors.EDITOR_WORKER_FILTER_VALUE,
    );
    await click(commonSelectors.SAVE_BTN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
    assert
      .dom(selectors.FIELD_BUCKET_NAME_ERROR)
      .hasText('This is a required field.');
    assert
      .dom(selectors.FIELD_WORKER_FILTER_ERROR)
      .hasText('Worker filter is required.');
  });

  test('user cannot edit scope, provider, bucket name, bucket prefix and region fields in a Amazon S3 storage bucket form', async function (assert) {
    await visit(urls.storageBuckets);

    await click(commonSelectors.HREF(urls.storageBucket));

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

    await click(commonSelectors.HREF(urls.storageBucketMinio));

    assert.dom(selectors.FIELD_BUCKET_NAME).isDisabled();

    await click(commonSelectors.EDIT_BTN, 'Click edit mode');

    assert.dom(selectors.FIELD_SCOPE).doesNotExist();
    assert.dom(selectors.FIELD_PLUGIN_TYPE).isDisabled();
    assert.dom(selectors.FIELD_ENDPOINT_URL).isNotDisabled();
    assert.dom(selectors.FIELD_BUCKET_NAME).hasAttribute('readOnly');
    assert.dom(selectors.FIELD_REGION).hasAttribute('readOnly');
  });

  test('user sees an editable code editor while updating and readonly code block before/after', async function (assert) {
    await visit(urls.storageBuckets);
    await click(commonSelectors.HREF(urls.storageBucketMinio));

    assert.dom(selectors.READONLY_WORKER_FILTER).isVisible();
    assert.dom(commonSelectors.CODE_EDITOR_CONTENT).doesNotExist();

    await click(commonSelectors.EDIT_BTN, 'Click edit mode');

    assert.dom(commonSelectors.CODE_EDITOR_CONTENT).isVisible();
    assert.dom(selectors.READONLY_WORKER_FILTER).doesNotExist();
  });
});
