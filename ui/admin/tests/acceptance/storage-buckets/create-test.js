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

module('Acceptance | storage-buckets | create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let features;
  let getStorageBucketCount;

  const SAVE_BTN_SELECTOR = '[type="submit"]';
  const CANCEL_BTN_SELECTOR = '.rose-form-actions [type="button"]';
  const NAME_FIELD_SELECTOR = '[name="name"]';
  const ALERT_TEXT_SELECTOR = '[role="alert"] div';
  const FIELD_ERROR_TEXT_SELECTOR = '.hds-form-error__message';
  const NAME_FIELD_TEXT = 'random string';
  const BUCKET_NAME_FIELD_SELECTOR = '[name="bucket_name"]';
  const BUCKET_PREFIX_FIELD_SELECTOR = '[name="bucket_prefix"]';
  const STATIC_CREDENTIAL_SELECTOR = '[value="static"]';
  const DYNAMIC_CREDENTIAL_SELECTOR = '[value="dynamic"]';
  const ROLE_ARN_SELECTOR = '[name="role_arn"]';
  const ACCESS_KEY_SELECTOR = '[name="access_key_id"]';
  const SECRET_KEY_SELECTOR = '[name="secret_access_key"]';
  const SCOPE_SELECTOR = '[name=scope]';
  const CREDENTIAL_TYPE_GROUP_SELECTOR = '[name=credential_type]';
  const MINIO_PLUGIN_TYPE_SELECTOR = '[value=minio]';
  const ENDPOINT_URL_SELECTOR = '[name=endpoint_url]';
  const ENDPOINT_URL_TEXT = 'http://www.hashicorp.com';

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
    await fillIn(NAME_FIELD_SELECTOR, NAME_FIELD_TEXT);
    await select(SCOPE_SELECTOR, 'global');

    assert.dom(BUCKET_NAME_FIELD_SELECTOR).isNotDisabled();
    assert.dom(BUCKET_PREFIX_FIELD_SELECTOR).isNotDisabled();
    assert.dom(BUCKET_NAME_FIELD_SELECTOR).doesNotHaveAttribute('readOnly');
    assert.dom(BUCKET_PREFIX_FIELD_SELECTOR).doesNotHaveAttribute('readOnly');

    await click(SAVE_BTN_SELECTOR);
    const storageBucket = this.server.schema.storageBuckets.findBy({
      name: NAME_FIELD_TEXT,
    });

    assert.strictEqual(storageBucket.name, NAME_FIELD_TEXT);
    assert.strictEqual(storageBucket.scopeId, 'global');
    assert.strictEqual(getStorageBucketCount(), storageBucketCount + 1);
  });

  test('users can create a new storage bucket aws plugin type with org scope', async function (assert) {
    const storageBucketCount = getStorageBucketCount();
    await visit(urls.storageBuckets);

    await click(`[href="${urls.newStorageBucket}"]`);
    await fillIn(NAME_FIELD_SELECTOR, NAME_FIELD_TEXT);
    await select(SCOPE_SELECTOR, instances.scopes.org.id);

    assert.dom(BUCKET_NAME_FIELD_SELECTOR).isNotDisabled();
    assert.dom(BUCKET_PREFIX_FIELD_SELECTOR).isNotDisabled();
    assert.dom(BUCKET_NAME_FIELD_SELECTOR).doesNotHaveAttribute('readOnly');
    assert.dom(BUCKET_PREFIX_FIELD_SELECTOR).doesNotHaveAttribute('readOnly');

    await click(SAVE_BTN_SELECTOR);
    const storageBucket = this.server.schema.storageBuckets.findBy({
      name: NAME_FIELD_TEXT,
    });

    assert.dom(ALERT_TEXT_SELECTOR).hasText('Saved successfully.');
    assert.strictEqual(storageBucket.name, NAME_FIELD_TEXT);
    assert.strictEqual(storageBucket.scopeId, instances.scopes.org.id);
    assert.strictEqual(getStorageBucketCount(), storageBucketCount + 1);
  });

  test('users can create a new storage bucket minio plugin type with org scope', async function (assert) {
    const storageBucketCount = getStorageBucketCount();

    // Navigate to new storage bucket
    await visit(urls.storageBuckets);
    await click(`[href="${urls.newStorageBucket}"]`);

    // Fill the form
    await fillIn(NAME_FIELD_SELECTOR, NAME_FIELD_TEXT);
    await click(MINIO_PLUGIN_TYPE_SELECTOR);
    await select(SCOPE_SELECTOR, instances.scopes.org.id);
    await fillIn(ENDPOINT_URL_SELECTOR, ENDPOINT_URL_TEXT);
    await fillIn(BUCKET_NAME_FIELD_SELECTOR, 'Test SB');
    await fillIn(ACCESS_KEY_SELECTOR, 'access_key_id');
    await fillIn(SECRET_KEY_SELECTOR, 'secret_access_key');
    await click(SAVE_BTN_SELECTOR);

    // Assertions
    const storageBucket = this.server.schema.storageBuckets.findBy({
      name: NAME_FIELD_TEXT,
    });
    assert.dom(ALERT_TEXT_SELECTOR).hasText('Saved successfully.');
    assert.strictEqual(storageBucket.name, NAME_FIELD_TEXT);
    assert.strictEqual(
      storageBucket.attributes.endpoint_url,
      ENDPOINT_URL_TEXT,
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
    await fillIn(NAME_FIELD_SELECTOR, NAME_FIELD_TEXT);

    // There are 2 credential types
    assert
      .dom(`${CREDENTIAL_TYPE_GROUP_SELECTOR} .hds-form-radio-card`)
      .exists({ count: 2 });

    await click(DYNAMIC_CREDENTIAL_SELECTOR);
    await fillIn(ROLE_ARN_SELECTOR, 'test-arn-id');

    await click(SAVE_BTN_SELECTOR);
    const storageBucket = this.server.schema.storageBuckets.findBy({
      name: NAME_FIELD_TEXT,
    });

    assert.strictEqual(storageBucket.name, NAME_FIELD_TEXT);
    //for dynamic credentials, there should be no secret field
    assert.notOk(storageBucket.secret);
    assert.strictEqual(getStorageBucketCount(), storageBucketCount + 1);
  });

  test('users can create a new storage bucket aws plugin type with static credentials', async function (assert) {
    const storageBucketCount = getStorageBucketCount();
    await visit(urls.storageBuckets);

    await click(`[href="${urls.newStorageBucket}"]`);
    await fillIn(NAME_FIELD_SELECTOR, NAME_FIELD_TEXT);
    assert
      .dom(`${CREDENTIAL_TYPE_GROUP_SELECTOR} .hds-form-radio-card`)
      .exists({ count: 2 });

    await click(STATIC_CREDENTIAL_SELECTOR);
    await fillIn(ACCESS_KEY_SELECTOR, 'access_key_id');
    await fillIn(SECRET_KEY_SELECTOR, 'secret_access_key');

    await click(SAVE_BTN_SELECTOR);

    const storageBucket = this.server.schema.storageBuckets.findBy({
      name: NAME_FIELD_TEXT,
    });

    assert.strictEqual(storageBucket.name, NAME_FIELD_TEXT);
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
    await fillIn(NAME_FIELD_SELECTOR, NAME_FIELD_TEXT);
    await click(MINIO_PLUGIN_TYPE_SELECTOR);
    await fillIn(ENDPOINT_URL_SELECTOR, ENDPOINT_URL_TEXT);
    await fillIn(BUCKET_NAME_FIELD_SELECTOR, 'Test SB');
    await fillIn(ACCESS_KEY_SELECTOR, 'access_key_id');
    await fillIn(SECRET_KEY_SELECTOR, 'secret_access_key');

    await click(SAVE_BTN_SELECTOR);

    // Retrieve recently created SB
    const storageBucket = await this.server.schema.storageBuckets.findBy({
      name: NAME_FIELD_TEXT,
    });

    // Assertions
    assert.strictEqual(storageBucket.name, NAME_FIELD_TEXT);
    assert.strictEqual(
      storageBucket.attributes.endpoint_url,
      ENDPOINT_URL_TEXT,
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
    await fillIn(NAME_FIELD_SELECTOR, NAME_FIELD_TEXT);
    await click(CANCEL_BTN_SELECTOR);

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
                name: 'name',
                description: 'Name is required.',
              },
            ],
          },
        },
      );
    });
    await visit(urls.storageBuckets);

    await click(`[href="${urls.newStorageBucket}"]`);
    await click(SAVE_BTN_SELECTOR);
    await a11yAudit();

    assert.dom(ALERT_TEXT_SELECTOR).hasText('The request was invalid.');
    assert.dom(FIELD_ERROR_TEXT_SELECTOR).hasText('Name is required.');
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
