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
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from '../selectors';

module(
  'Acceptance | targets | enable session recording | create storage bucket',
  function (hooks) {
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

      urls.targets = `/scopes/${instances.scopes.project.id}/targets`;
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

      await click(commonSelectors.HREF(urls.newStorageBucket));
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await click(selectors.FIELD_SCOPE('global'));
      await fillIn(selectors.FIELD_EDITOR, selectors.WORKER_FILTER_VALUE);

      assert.dom(selectors.FIELD_BUCKET_NAME).isNotDisabled();
      assert.dom(selectors.FIELD_BUCKET_PREFIX).isNotDisabled();
      assert.dom(selectors.FIELD_BUCKET_NAME).doesNotHaveAttribute('readOnly');
      assert
        .dom(selectors.FIELD_BUCKET_PREFIX)
        .doesNotHaveAttribute('readOnly');

      await click(commonSelectors.SAVE_BTN);
      const storageBucket = this.server.schema.storageBuckets.findBy({
        name: commonSelectors.FIELD_NAME_VALUE,
      });

      assert.strictEqual(storageBucket.name, commonSelectors.FIELD_NAME_VALUE);
      assert.strictEqual(storageBucket.scopeId, 'global');
      assert.strictEqual(getStorageBucketCount(), storageBucketCount + 1);
    });

    test('users can create a new storage bucket with org scope', async function (assert) {
      const storageBucketCount = getStorageBucketCount();
      await visit(urls.enableSessionRecording);

      await click(commonSelectors.HREF(urls.newStorageBucket));
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await click(selectors.FIELD_SCOPE(instances.scopes.org.scope.id));
      await fillIn(selectors.FIELD_EDITOR, selectors.WORKER_FILTER_VALUE);

      assert.dom(selectors.FIELD_BUCKET_NAME).isNotDisabled();
      assert.dom(selectors.FIELD_BUCKET_PREFIX).isNotDisabled();
      assert.dom(selectors.FIELD_BUCKET_NAME).doesNotHaveAttribute('readOnly');
      assert
        .dom(selectors.FIELD_BUCKET_PREFIX)
        .doesNotHaveAttribute('readOnly');

      await click(commonSelectors.SAVE_BTN);
      const storageBucket = this.server.schema.storageBuckets.findBy({
        name: commonSelectors.FIELD_NAME_VALUE,
      });

      assert.strictEqual(storageBucket.name, commonSelectors.FIELD_NAME_VALUE);
      assert.strictEqual(storageBucket.scopeId, instances.scopes.org.scope.id);
      assert.strictEqual(getStorageBucketCount(), storageBucketCount + 1);
    });

    test('user can cancel new storage bucket creation', async function (assert) {
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
      await fillIn(selectors.FIELD_EDITOR, selectors.WORKER_FILTER_VALUE);
      await click(commonSelectors.SAVE_BTN);

      assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(errorMessage);
      assert.dom(commonSelectors.FIELD_NAME_ERROR).hasText(errorDescription);
    });
  },
);
