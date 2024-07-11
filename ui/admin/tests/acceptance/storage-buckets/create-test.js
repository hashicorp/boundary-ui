/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn, select } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as selectors from './selectors';

module('Acceptance | storage-buckets | create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let features;
  let getStorageBucketCount;

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
  };

  const urls = {
    globalScope: null,
    storageBuckets: null,
    newStorageBucket: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    urls.globalScope = `/scopes/global`;
    urls.storageBuckets = `${urls.globalScope}/storage-buckets`;
    urls.newStorageBucket = `${urls.storageBuckets}/new`;
    getStorageBucketCount = () =>
      this.server.schema.storageBuckets.all().models.length;

    features = this.owner.lookup('service:features');
    features.enable('ssh-session-recording');
    authenticateSession({});
  });

  test('users can create a new storage bucket aws plugin type with global scope', async function (assert) {
    const storageBucketCount = getStorageBucketCount();
    await visit(urls.storageBuckets);

    await click(`[href="${urls.newStorageBucket}"]`);
    await fillIn(selectors.FIELD_NAME, selectors.FIELD_NAME_VALUE);
    await select(selectors.FIELD_SCOPE, 'global');

    assert.dom(selectors.FIELD_BUCKET_NAME).isNotDisabled();
    assert.dom(selectors.FIELD_BUCKET_PREFIX).isNotDisabled();
    assert.dom(selectors.FIELD_BUCKET_NAME).doesNotHaveAttribute('readOnly');
    assert.dom(selectors.FIELD_BUCKET_PREFIX).doesNotHaveAttribute('readOnly');

    await click(selectors.SAVE_BTN);
    const storageBucket = this.server.schema.storageBuckets.findBy({
      name: selectors.FIELD_NAME_VALUE,
    });

    assert.strictEqual(storageBucket.name, selectors.FIELD_NAME_VALUE);
    assert.strictEqual(storageBucket.scopeId, 'global');
    assert.strictEqual(getStorageBucketCount(), storageBucketCount + 1);
  });

  test('users can create a new storage bucket aws plugin type with org scope', async function (assert) {
    const storageBucketCount = getStorageBucketCount();
    await visit(urls.storageBuckets);

    await click(`[href="${urls.newStorageBucket}"]`);
    await fillIn(selectors.FIELD_NAME, selectors.FIELD_NAME_VALUE);
    await select(selectors.FIELD_SCOPE, instances.scopes.org.id);

    assert.dom(selectors.FIELD_BUCKET_NAME).isNotDisabled();
    assert.dom(selectors.FIELD_BUCKET_PREFIX).isNotDisabled();
    assert.dom(selectors.FIELD_BUCKET_NAME).doesNotHaveAttribute('readOnly');
    assert.dom(selectors.FIELD_BUCKET_PREFIX).doesNotHaveAttribute('readOnly');

    await click(selectors.SAVE_BTN);
    const storageBucket = this.server.schema.storageBuckets.findBy({
      name: selectors.FIELD_NAME_VALUE,
    });

    assert.dom(selectors.TOAST).hasText(selectors.TOAST_SUCCESSFULL_VALUE);
    assert.strictEqual(storageBucket.name, selectors.FIELD_NAME_VALUE);
    assert.strictEqual(storageBucket.scopeId, instances.scopes.org.id);
    assert.strictEqual(getStorageBucketCount(), storageBucketCount + 1);
  });

  test('users can create a new storage bucket minio plugin type with org scope', async function (assert) {
    const storageBucketCount = getStorageBucketCount();

    // Navigate to new storage bucket
    await visit(urls.storageBuckets);
    await click(`[href="${urls.newStorageBucket}"]`);

    // Fill the form
    await fillIn(selectors.FIELD_NAME, selectors.FIELD_NAME_VALUE);
    await click(selectors.FIELD_PLUGIN_TYPE_MINIO);
    await select(selectors.FIELD_SCOPE, instances.scopes.org.id);
    await fillIn(
      selectors.FIELD_ENDPOINT_URL,
      selectors.FIELD_ENDPOINT_URL_VALUE,
    );
    await fillIn(
      selectors.FIELD_BUCKET_NAME,
      selectors.FIELD_BUCKET_NAME_VALUE,
    );
    await fillIn(selectors.FIELD_ACCESS_KEY, selectors.FIELD_ACCESS_KEY_VALUE);
    await fillIn(selectors.FIELD_SECRET_KEY, selectors.FIELD_SECRET_KEY_VALUE);
    await click(selectors.SAVE_BTN);

    // Assertions
    const storageBucket = this.server.schema.storageBuckets.findBy({
      name: selectors.FIELD_NAME_VALUE,
    });
    assert.dom(selectors.TOAST).hasText(selectors.TOAST_SUCCESSFULL_VALUE);
    assert.strictEqual(storageBucket.name, selectors.FIELD_NAME_VALUE);
    assert.strictEqual(
      storageBucket.attributes.endpoint_url,
      selectors.FIELD_ENDPOINT_URL_VALUE,
    );
    assert.strictEqual(storageBucket.attributes.role_arn, null);
    assert.strictEqual(storageBucket.plugin.name, 'minio');
    assert.strictEqual(storageBucket.scopeId, instances.scopes.org.id);
    assert.strictEqual(getStorageBucketCount(), storageBucketCount + 1);
  });

  test('users can create a new storage bucket aws plugin type with dynamic credentials', async function (assert) {
    const storageBucketCount = getStorageBucketCount();
    await visit(urls.storageBuckets);

    await click(`[href="${urls.newStorageBucket}"]`);
    await fillIn(selectors.FIELD_NAME, selectors.FIELD_NAME_VALUE);

    // There are 2 credential types
    assert
      .dom(`${selectors.GROUP_CREDENTIAL_TYPE} .hds-form-radio-card`)
      .exists({ count: 2 });

    await click(selectors.FIELD_DYNAMIC_CREDENTIAL);
    await fillIn(selectors.FIELD_ROLE_ARN, selectors.FIELD_ROLE_ARN_VALUE);

    await click(selectors.SAVE_BTN);
    const storageBucket = this.server.schema.storageBuckets.findBy({
      name: selectors.FIELD_NAME_VALUE,
    });

    assert.strictEqual(storageBucket.name, selectors.FIELD_NAME_VALUE);
    //for dynamic credentials, there should be no secret field
    assert.notOk(storageBucket.secret);
    assert.strictEqual(getStorageBucketCount(), storageBucketCount + 1);
  });

  test('users can create a new storage bucket aws plugin type with static credentials', async function (assert) {
    const storageBucketCount = getStorageBucketCount();
    await visit(urls.storageBuckets);

    await click(`[href="${urls.newStorageBucket}"]`);
    await fillIn(selectors.FIELD_NAME, selectors.FIELD_NAME_VALUE);
    assert
      .dom(`${selectors.GROUP_CREDENTIAL_TYPE} .hds-form-radio-card`)
      .exists({ count: 2 });

    await click(selectors.FIELD_STATIC_CREDENTIAL);
    await fillIn(selectors.FIELD_ACCESS_KEY, selectors.FIELD_ACCESS_KEY_VALUE);
    await fillIn(selectors.FIELD_SECRET_KEY, selectors.FIELD_SECRET_KEY_VALUE);

    await click(selectors.SAVE_BTN);

    const storageBucket = this.server.schema.storageBuckets.findBy({
      name: selectors.FIELD_NAME_VALUE,
    });

    assert.strictEqual(storageBucket.name, selectors.FIELD_NAME_VALUE);
    //for static credentials, role_arn should be null
    assert.strictEqual(storageBucket.attributes.role_arn, null);
    assert.strictEqual(getStorageBucketCount(), storageBucketCount + 1);
  });

  test('users can create a new storage bucket minio plugin type', async function (assert) {
    const storageBucketCount = getStorageBucketCount();

    // Navigate to new storage bucket
    await visit(urls.storageBuckets);
    await click(`[href="${urls.newStorageBucket}"]`);

    // Fill the form
    await fillIn(selectors.FIELD_NAME, selectors.FIELD_NAME_VALUE);
    await click(selectors.FIELD_PLUGIN_TYPE_MINIO);
    await fillIn(
      selectors.FIELD_ENDPOINT_URL,
      selectors.FIELD_ENDPOINT_URL_VALUE,
    );
    await fillIn(
      selectors.FIELD_BUCKET_NAME,
      selectors.FIELD_BUCKET_NAME_VALUE,
    );
    await fillIn(selectors.FIELD_ACCESS_KEY, selectors.FIELD_ACCESS_KEY_VALUE);
    await fillIn(selectors.FIELD_SECRET_KEY, selectors.FIELD_SECRET_KEY_VALUE);

    await click(selectors.SAVE_BTN);

    // Retrieve recently created SB
    const storageBucket = await this.server.schema.storageBuckets.findBy({
      name: selectors.FIELD_NAME_VALUE,
    });

    // Assertions
    assert.strictEqual(storageBucket.name, selectors.FIELD_NAME_VALUE);
    assert.strictEqual(
      storageBucket.attributes.endpoint_url,
      selectors.FIELD_ENDPOINT_URL_VALUE,
    );
    assert.strictEqual(storageBucket.attributes.role_arn, null);
    assert.strictEqual(storageBucket.plugin.name, 'minio');
    assert.strictEqual(storageBucket.type, 'plugin');
    assert.strictEqual(getStorageBucketCount(), storageBucketCount + 1);
  });

  test('user can cancel new storage bucket creation', async function (assert) {
    const storageBucketCount = getStorageBucketCount();
    await visit(urls.storageBuckets);

    await click(`[href="${urls.newStorageBucket}"]`);
    await fillIn(selectors.FIELD_NAME, selectors.FIELD_NAME_VALUE);

    await click(selectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.storageBuckets);
    assert.strictEqual(getStorageBucketCount(), storageBucketCount);
  });

  test('saving a new storage bucket with invalid fields displays error messages', async function (assert) {
    this.server.post('/storage-buckets', () => {
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
            ],
          },
        },
      );
    });
    await visit(urls.storageBuckets);

    await click(`[href="${urls.newStorageBucket}"]`);
    await click(selectors.SAVE_BTN);
    await a11yAudit();

    assert.dom(selectors.TOAST).hasText('The request was invalid.');
    assert
      .dom(selectors.FIELD_BUCKET_NAME_ERROR)
      .hasText('This is a required field.');
  });

  test('users cannot directly navigate to new storage bucket route without proper authorization', async function (assert) {
    instances.scopes.global.authorized_collection_actions['storage-buckets'] =
      instances.scopes.global.authorized_collection_actions[
        'storage-buckets'
      ].filter((item) => item !== 'create');

    await visit(urls.newStorageBucket);

    assert.false(
      instances.scopes.global.authorized_collection_actions[
        'storage-buckets'
      ].includes('create'),
    );
    assert.strictEqual(currentURL(), urls.storageBuckets);
  });
});
