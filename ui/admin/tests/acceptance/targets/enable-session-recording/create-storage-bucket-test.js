/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { Response } from 'miragejs';
import { TYPE_TARGET_SSH } from 'api/models/target';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module(
  'Acceptance | targets | enable session recording | create storage bucket',
  function (hooks) {
    setupApplicationTest(hooks);
    setupSqlite(hooks);

    let features;
    let getStorageBucketCount;

    const FIELD_BUCKET_NAME = '[name="bucket_name"]';
    const FIELD_BUCKET_PREFIX = '[name="bucket_prefix"]';
    const FIELD_EDITOR = '[data-test-code-editor-field-editor] textarea';
    const WORKER_FILTER_VALUE = '"dev" in "/tags/env"';
    const FIELD_SCOPE = (scope) => `[value="${scope}"]`;

    const instances = {
      scopes: {
        org: null,
      },
    };

    const urls = {
      targets: null,
      target: null,
      enableSessionRecording: null,
      newStorageBucket: null,
    };

    hooks.beforeEach(async function () {
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

      urls.targets = `/scopes/${instances.scopes.project.id}/targets`;
      urls.target = `${urls.targets}/${instances.target.id}`;
      urls.enableSessionRecording = `${urls.target}/enable-session-recording`;
      urls.newStorageBucket = `${urls.enableSessionRecording}/create-storage-bucket`;
      getStorageBucketCount = () =>
        this.server.schema.storageBuckets.all().models.length;

      features = this.owner.lookup('service:features');
      features.enable('ssh-session-recording');
    });

    test('users can create a new storage bucket with global scope', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },

          label: {
            // [ember-a11y-ignore]: axe rule "label" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      const storageBucketCount = getStorageBucketCount();
      await visit(urls.enableSessionRecording);

      await click(commonSelectors.HREF(urls.newStorageBucket));
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await click(FIELD_SCOPE('global'));
      await fillIn(FIELD_EDITOR, WORKER_FILTER_VALUE);

      assert.dom(FIELD_BUCKET_NAME).isNotDisabled();
      assert.dom(FIELD_BUCKET_PREFIX).isNotDisabled();
      assert.dom(FIELD_BUCKET_NAME).doesNotHaveAttribute('readOnly');
      assert.dom(FIELD_BUCKET_PREFIX).doesNotHaveAttribute('readOnly');

      await click(commonSelectors.SAVE_BTN);
      const storageBucket = this.server.schema.storageBuckets.findBy({
        name: commonSelectors.FIELD_NAME_VALUE,
      });

      assert.strictEqual(storageBucket.name, commonSelectors.FIELD_NAME_VALUE);
      assert.strictEqual(storageBucket.scopeId, 'global');
      assert.strictEqual(getStorageBucketCount(), storageBucketCount + 1);
    });

    test('users can create a new storage bucket with org scope', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },

          label: {
            // [ember-a11y-ignore]: axe rule "label" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      const storageBucketCount = getStorageBucketCount();
      await visit(urls.enableSessionRecording);

      await click(commonSelectors.HREF(urls.newStorageBucket));
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await click(FIELD_SCOPE(instances.scopes.org.scope.id));
      await fillIn(FIELD_EDITOR, WORKER_FILTER_VALUE);

      assert.dom(FIELD_BUCKET_NAME).isNotDisabled();
      assert.dom(FIELD_BUCKET_PREFIX).isNotDisabled();
      assert.dom(FIELD_BUCKET_NAME).doesNotHaveAttribute('readOnly');
      assert.dom(FIELD_BUCKET_PREFIX).doesNotHaveAttribute('readOnly');

      await click(commonSelectors.SAVE_BTN);
      const storageBucket = this.server.schema.storageBuckets.findBy({
        name: commonSelectors.FIELD_NAME_VALUE,
      });

      assert.strictEqual(storageBucket.name, commonSelectors.FIELD_NAME_VALUE);
      assert.strictEqual(storageBucket.scopeId, instances.scopes.org.scope.id);
      assert.strictEqual(getStorageBucketCount(), storageBucketCount + 1);
    });

    test('user can cancel new storage bucket creation', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },

          label: {
            // [ember-a11y-ignore]: axe rule "label" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      const storageBucketCount = getStorageBucketCount();
      await visit(urls.enableSessionRecording);

      await click(commonSelectors.HREF(urls.newStorageBucket));
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await click(commonSelectors.CANCEL_BTN);

      assert.strictEqual(currentURL(), urls.enableSessionRecording);
      assert.strictEqual(getStorageBucketCount(), storageBucketCount);
    });

    test('saving a new storage bucket with invalid fields displays error messages', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },

          label: {
            // [ember-a11y-ignore]: axe rule "label" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      const errorMessage = 'The request was invalid.';
      const errorDescription = 'Name is required.';
      this.server.post('/storage-buckets', () => {
        return new Response(
          400,
          {},
          {
            status: 400,
            code: 'invalid_argument',
            message: errorMessage,
            details: {
              request_fields: [
                {
                  name: 'name',
                  description: errorDescription,
                },
              ],
            },
          },
        );
      });
      await visit(urls.enableSessionRecording);

      await click(commonSelectors.HREF(urls.newStorageBucket));
      await fillIn(FIELD_EDITOR, WORKER_FILTER_VALUE);
      await click(commonSelectors.SAVE_BTN);

      assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(errorMessage);
      assert.dom(commonSelectors.FIELD_NAME_ERROR).hasText(errorDescription);
    });
  },
);
