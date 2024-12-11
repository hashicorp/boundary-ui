/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { TYPE_TARGET_SSH } from 'api/models/target';

module(
  'Acceptance | targets | enable session recording | create storage bucket',
  function (hooks) {
    setupApplicationTest(hooks);
    setupMirage(hooks);

    let features;
    let getStorageBucketCount;

    const SAVE_BTN_SELECTOR = '[type="submit"]';
    const CANCEL_BTN_SELECTOR = '.rose-form-actions [type="button"]';
    const NAME_FIELD_SELECTOR = '[name="name"]';
    const ALERT_TEXT_SELECTOR =
      '[data-test-toast-notification] .hds-alert__description';
    const FIELD_ERROR_TEXT_SELECTOR = '.hds-form-error__message';
    const NAME_FIELD_TEXT = 'random string';
    const BUCKET_NAME_FIELD_SELECTOR = '[name="bucket_name"]';
    const BUCKET_PREFIX_FIELD_SELECTOR = '[name="bucket_prefix"]';
    const EDITOR_WORKER_FILTER =
      '[data-test-code-editor-field-editor] textarea';
    const EDITOR_WORKER_FILTER_VALUE = '"dev" in "/tags/env"';

    const instances = {
      scopes: {
        global: null,
        org: null,
      },
    };

    const urls = {
      globalScope: null,
      projectScope: null,
      targets: null,
      target: null,
      enableSessionRecording: null,
      newStorageBucket: null,
    };

    hooks.beforeEach(async function () {
      instances.scopes.global = this.server.create('scope', { id: 'global' });
      instances.scopes.org = this.server.create('scope', {
        type: 'org',
        scope: { id: 'global', type: 'global' },
      });
      instances.scopes.project = this.server.create('scope', {
        type: 'project',
        scope: { id: instances.scopes.org.id, type: 'org' },
      });

      instances.target = this.server.create('target', {
        scope: instances.scopes.project,
        type: TYPE_TARGET_SSH,
      });
      urls.globalScope = `/scopes/global`;

      urls.projectScope = `/scopes/${instances.scopes.project.id}`;
      urls.targets = `${urls.projectScope}/targets`;
      urls.target = `${urls.targets}/${instances.target.id}`;
      urls.enableSessionRecording = `${urls.target}/enable-session-recording`;
      urls.newStorageBucket = `${urls.enableSessionRecording}/create-storage-bucket`;
      getStorageBucketCount = () =>
        this.server.schema.storageBuckets.all().models.length;

      features = this.owner.lookup('service:features');
      features.enable('ssh-session-recording');
      await authenticateSession({ username: 'admin' });
    });

    test('users can create a new storage bucket with global scope', async function (assert) {
      const storageBucketCount = getStorageBucketCount();
      await visit(urls.enableSessionRecording);

      await click(`[href="${urls.newStorageBucket}"]`);
      await fillIn(NAME_FIELD_SELECTOR, NAME_FIELD_TEXT);
      await click('[value="global"]');
      await fillIn(EDITOR_WORKER_FILTER, EDITOR_WORKER_FILTER_VALUE);

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

    test('users can create a new storage bucket with org scope', async function (assert) {
      const storageBucketCount = getStorageBucketCount();
      await visit(urls.enableSessionRecording);

      await click(`[href="${urls.newStorageBucket}"]`);
      await fillIn(NAME_FIELD_SELECTOR, NAME_FIELD_TEXT);
      await click(`[value="${instances.scopes.org.scope.id}"]`);
      await fillIn(EDITOR_WORKER_FILTER, EDITOR_WORKER_FILTER_VALUE);

      assert.dom(BUCKET_NAME_FIELD_SELECTOR).isNotDisabled();
      assert.dom(BUCKET_PREFIX_FIELD_SELECTOR).isNotDisabled();
      assert.dom(BUCKET_NAME_FIELD_SELECTOR).doesNotHaveAttribute('readOnly');
      assert.dom(BUCKET_PREFIX_FIELD_SELECTOR).doesNotHaveAttribute('readOnly');

      await click(SAVE_BTN_SELECTOR);
      const storageBucket = this.server.schema.storageBuckets.findBy({
        name: NAME_FIELD_TEXT,
      });

      assert.strictEqual(storageBucket.name, NAME_FIELD_TEXT);
      assert.strictEqual(storageBucket.scopeId, instances.scopes.org.scope.id);
      assert.strictEqual(getStorageBucketCount(), storageBucketCount + 1);
    });

    test('user can cancel new storage bucket creation', async function (assert) {
      const storageBucketCount = getStorageBucketCount();
      await visit(urls.enableSessionRecording);

      await click(`[href="${urls.newStorageBucket}"]`);
      await fillIn(NAME_FIELD_SELECTOR, NAME_FIELD_TEXT);
      await click(CANCEL_BTN_SELECTOR);

      assert.strictEqual(currentURL(), urls.enableSessionRecording);
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
      await visit(urls.enableSessionRecording);

      await click(`[href="${urls.newStorageBucket}"]`);
      await fillIn(EDITOR_WORKER_FILTER, EDITOR_WORKER_FILTER_VALUE);
      await click(SAVE_BTN_SELECTOR);

      assert.dom(ALERT_TEXT_SELECTOR).hasText('The request was invalid.');
      assert.dom(FIELD_ERROR_TEXT_SELECTOR).hasText('Name is required.');
    });
  },
);
