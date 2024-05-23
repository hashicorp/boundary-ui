/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, fillIn, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | storage-buckets | update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let features;

  const BUTTON_SELECTOR = '.rose-form-actions [type="button"]';
  const SAVE_BUTTON_SELECTOR = '.rose-form-actions [type="submit"]';
  const NAME_FIELD_SELECTOR = '[name="name"]';
  const ALERT_TEXT_SELECTOR = '[role="alert"] div';
  const SECRET_FIELD_BUTTON_SELECTOR = '.secret-input [type="button"]';
  const ACCESS_KEY_ID_FIELD_SELECTOR = '[name="access_key_id"]';
  const SECRET_ACCESS_KEY_FIELD_SELECTOR = '[name="secret_access_key"]';
  const NAME_FIELD_TEXT = 'Updated storage-bucket name';
  const ACCESS_KEY_ID_FIELD_TEXT = 'Updated access key id';
  const SECRET_ACCESS_KEY_FIELD_TEXT = 'Update secret access key';
  const BUCKET_NAME_FIELD_SELECTOR = '[name="bucket_name"]';
  const BUCKET_PREFIX_FIELD_SELECTOR = '[name="bucket_prefix"]';
  const WORKER_FILTER = '[name="worker_filter"]';
  const FIELD_STORAGE_BUCKET_NAME_ERROR = '[data-test-bucket-name-error]';
  const FIELD_WORKER_FILTER_ERROR = '[data-test-worker-filter-error]';
  const FIELD_REGION = '[name=region]';
  const FIELD_PROVIDER = '[name=plugin_type]';
  const FIELD_ENDPOINT_URL = '[name=endpoint_url]';
  const FIELD_SCOPE = '[name=scope]';

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
    await click(BUTTON_SELECTOR, 'Click edit mode');
    await fillIn(NAME_FIELD_SELECTOR, NAME_FIELD_TEXT);
    await click(SAVE_BUTTON_SELECTOR, 'Click save');

    assert.dom(`[href="${urls.storageBucket}"]`).isVisible();
    assert.dom(NAME_FIELD_SELECTOR).hasValue(NAME_FIELD_TEXT);
    assert.strictEqual(instances.storageBucket.name, NAME_FIELD_TEXT);
  });

  test('can cancel changes to an existing storage-bucket', async function (assert) {
    const name = instances.storageBucket.name;
    await visit(urls.storageBuckets);

    await click(`[href="${urls.storageBucket}"]`);
    await click(BUTTON_SELECTOR, 'Click edit mode');
    await fillIn(NAME_FIELD_SELECTOR, NAME_FIELD_TEXT);
    await click(BUTTON_SELECTOR, 'Click cancel');

    assert.dom(NAME_FIELD_SELECTOR).hasValue(`${name}`);
    assert.strictEqual(instances.storageBucket.name, name);
  });

  test('can save changes to access key fields', async function (assert) {
    await visit(urls.storageBuckets);

    await click(`[href="${urls.storageBucket}"]`);

    assert.dom(SECRET_FIELD_BUTTON_SELECTOR).exists({ count: 2 });

    assert.dom(SECRET_FIELD_BUTTON_SELECTOR).isDisabled();

    await click(BUTTON_SELECTOR, 'Click edit mode');

    assert.dom(SECRET_FIELD_BUTTON_SELECTOR).isEnabled();
    assert.dom(SECRET_FIELD_BUTTON_SELECTOR).hasText('Edit');

    await click(SECRET_FIELD_BUTTON_SELECTOR);
    await click(findAll(SECRET_FIELD_BUTTON_SELECTOR)[1]);

    assert.dom(SECRET_FIELD_BUTTON_SELECTOR).hasText('Cancel');

    await fillIn(ACCESS_KEY_ID_FIELD_SELECTOR, ACCESS_KEY_ID_FIELD_TEXT);
    await fillIn(
      SECRET_ACCESS_KEY_FIELD_SELECTOR,
      SECRET_ACCESS_KEY_FIELD_TEXT,
    );
    await click(SAVE_BUTTON_SELECTOR, 'Click save');

    assert.dom(SECRET_FIELD_BUTTON_SELECTOR).isDisabled();
    assert.dom(ACCESS_KEY_ID_FIELD_SELECTOR).hasNoValue();
    assert.dom(SECRET_ACCESS_KEY_FIELD_SELECTOR).hasNoValue();
  });

  test('can cancel changes to access key fields', async function (assert) {
    await visit(urls.storageBuckets);

    await click(`[href="${urls.storageBucket}"]`);
    await click(BUTTON_SELECTOR, 'Click edit mode');
    await click(SECRET_FIELD_BUTTON_SELECTOR, 'Click edit button');
    await click(findAll(SECRET_FIELD_BUTTON_SELECTOR)[1], 'Click edit button');
    await fillIn(ACCESS_KEY_ID_FIELD_SELECTOR, ACCESS_KEY_ID_FIELD_TEXT);
    await fillIn(
      SECRET_ACCESS_KEY_FIELD_SELECTOR,
      SECRET_ACCESS_KEY_FIELD_TEXT,
    );
    await click(SECRET_FIELD_BUTTON_SELECTOR, 'Click cancel button');
    await click(
      findAll(SECRET_FIELD_BUTTON_SELECTOR)[1],
      'Click cancel button',
    );
    await click(SAVE_BUTTON_SELECTOR, 'Click save');

    assert.dom(SECRET_FIELD_BUTTON_SELECTOR).isDisabled();
    assert.dom(ACCESS_KEY_ID_FIELD_SELECTOR).hasNoValue();
    assert.dom(SECRET_ACCESS_KEY_FIELD_SELECTOR).hasNoValue();
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
    await click(BUTTON_SELECTOR, 'Activate edit mode');
    await fillIn(WORKER_FILTER, 'random string');
    await click(SAVE_BUTTON_SELECTOR);

    assert.dom(ALERT_TEXT_SELECTOR).hasText('The request was invalid.');
    assert
      .dom(FIELD_STORAGE_BUCKET_NAME_ERROR)
      .hasText('This is a required field.');
    assert.dom(FIELD_WORKER_FILTER_ERROR).hasText('Worker filter is required.');
  });

  test('user cannot edit scope, provider, bucket name, bucket prefix and region fields in a Amazon S3 storage bucket form', async function (assert) {
    await visit(urls.storageBuckets);

    await click(`[href="${urls.storageBucket}"]`);

    assert.dom(BUCKET_NAME_FIELD_SELECTOR).isDisabled();
    assert.dom(BUCKET_PREFIX_FIELD_SELECTOR).isDisabled();

    await click(BUTTON_SELECTOR, 'Click edit mode');

    assert.dom(FIELD_SCOPE).doesNotExist();
    assert.dom(FIELD_PROVIDER).isDisabled();
    assert.dom(BUCKET_NAME_FIELD_SELECTOR).hasAttribute('readOnly');
    assert.dom(BUCKET_PREFIX_FIELD_SELECTOR).hasAttribute('readOnly');
    assert.dom(FIELD_REGION).hasAttribute('readOnly');
    assert.dom(BUCKET_NAME_FIELD_SELECTOR).isNotDisabled();
    assert.dom(BUCKET_PREFIX_FIELD_SELECTOR).isNotDisabled();
    assert.dom(FIELD_REGION).isNotDisabled();
  });

  test('user cannot edit scope, provider, endpoint_url, bucket name or region fields in a MinIO storage bucket', async function (assert) {
    await visit(urls.storageBuckets);

    await click(`[href="${urls.storageBucketMinio}"]`);

    assert.dom(BUCKET_NAME_FIELD_SELECTOR).isDisabled();

    await click(BUTTON_SELECTOR, 'Click edit mode');

    assert.dom(FIELD_SCOPE).doesNotExist();
    assert.dom(FIELD_PROVIDER).isDisabled();
    assert.dom(FIELD_ENDPOINT_URL).isNotDisabled();
    assert.dom(BUCKET_NAME_FIELD_SELECTOR).hasAttribute('readOnly');
    assert.dom(FIELD_REGION).hasAttribute('readOnly');
  });
});
