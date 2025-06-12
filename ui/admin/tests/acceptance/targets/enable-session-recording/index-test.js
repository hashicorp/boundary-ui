/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, find, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { TYPE_TARGET_SSH } from 'api/models/target';
import select from '@ember/test-helpers/dom/select';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from '../selectors';

module(
  'Acceptance | targets | enable session recording | index',
  function (hooks) {
    setupApplicationTest(hooks);
    setupMirage(hooks);
    let intl;
    let featuresService;
    let storageBucketOne;
    let storageBucketTwo;

    // Instances
    const instances = {
      scopes: {
        global: null,
        org: null,
      },
      sessionRecording: null,
    };

    //URLs
    const urls = {
      targets: null,
      target: null,
      enableSessionRecording: null,
      storageBuckets: null,
      storageBucket: null,
      newStorageBucket: null,
    };

    hooks.beforeEach(async function () {
      featuresService = this.owner.lookup('service:features');
      // Generate resources
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

      instances.storageBucket = this.server.createList('storage-bucket', 2, {
        scope: instances.scopes.global,
      });

      storageBucketOne = instances.storageBucket[0];
      storageBucketTwo = instances.storageBucket[1];

      // Generate route URLs for resources
      urls.targets = `/scopes/${instances.scopes.project.id}/targets`;
      urls.target = `${urls.targets}/${instances.target.id}`;
      urls.enableSessionRecording = `${urls.target}/enable-session-recording`;
      urls.storageBuckets = '/scopes/global/storage-buckets';
      urls.newStorageBucket = `${urls.enableSessionRecording}/create-storage-bucket`;
      urls.storageBucket = `${urls.storageBuckets}/${storageBucketOne.id}`;

      intl = this.owner.lookup('service:intl');

      await authenticateSession({ username: 'admin' });
    });

    test('cannot enable session recording for a target without proper authorization', async function (assert) {
      assert.false(featuresService.isEnabled('ssh-session-recording'));

      await visit(urls.target);
      await a11yAudit();

      assert.dom(selectors.SESSION_RECORDING_ENABLE_BTN).doesNotExist();
    });

    test('users can click on enable-recording button in target session-recording sidebar and it takes them to enable session recording', async function (assert) {
      featuresService.enable('ssh-session-recording');
      await visit(urls.target);

      assert.dom(selectors.SESSION_RECORDING_SETTINGS_LINK).doesNotExist();

      await click(selectors.SESSION_RECORDING_ENABLE_BTN);

      assert.strictEqual(currentURL(), urls.enableSessionRecording);
    });

    test('users can click on settings link in target session-recording sidebar and it takes them to enable session recording', async function (assert) {
      featuresService.enable('ssh-session-recording');
      instances.target.update({
        storageBucketId: storageBucketOne.id,
        enableSessionRecording: true,
      });
      await visit(urls.target);
      await click(selectors.SESSION_RECORDING_SETTINGS_LINK);

      assert.strictEqual(currentURL(), urls.enableSessionRecording);
    });

    test('users can click on associated storage bucket card on an ssh target', async function (assert) {
      featuresService.enable('ssh-session-recording');
      instances.target.update({
        storageBucketId: storageBucketOne.id,
        enableSessionRecording: true,
      });
      await visit(urls.target);
      await click(selectors.LINK_LIST);

      assert.strictEqual(currentURL(), urls.storageBucket);
    });

    test('toggle should be disabled and storage buckets list should be shown when enable session recording button is clicked', async function (assert) {
      featuresService.enable('ssh-session-recording');
      await visit(urls.target);
      await click(selectors.SESSION_RECORDING_ENABLE_BTN);

      assert.strictEqual(currentURL(), urls.enableSessionRecording);
      assert.dom(selectors.ENABLE_TOGGLE).isVisible();
      assert.dom(selectors.STORAGE_BUCKET_DROPDOWN).isNotVisible();
    });

    test('storage buckets list is hidden when toggle is disabled', async function (assert) {
      featuresService.enable('ssh-session-recording');
      await visit(urls.target);
      await click(selectors.SESSION_RECORDING_ENABLE_BTN);

      assert.strictEqual(currentURL(), urls.enableSessionRecording);
      assert.dom(selectors.ENABLE_TOGGLE).isVisible();
      assert.dom(selectors.STORAGE_BUCKET_DROPDOWN).isNotVisible();

      await click(selectors.ENABLE_TOGGLE);

      assert.dom(selectors.STORAGE_BUCKET_DROPDOWN).isVisible();
    });

    test('link to add new storage bucket should be displayed and redirect to new storage buckets form', async function (assert) {
      featuresService.enable('ssh-session-recording');
      await visit(urls.target);
      await click(selectors.SESSION_RECORDING_ENABLE_BTN);

      assert.strictEqual(currentURL(), urls.enableSessionRecording);
      assert.dom(selectors.LINK_TO_NEW_STORAGE_BUCKET).isVisible();

      await click(selectors.LINK_TO_NEW_STORAGE_BUCKET);

      assert.strictEqual(currentURL(), urls.newStorageBucket);
    });

    test('retain last selected dropdown list value when the toggle is off', async function (assert) {
      featuresService.enable('ssh-session-recording');
      instances.target.update({
        storageBucketId: storageBucketOne.id,
        enable_session_recording: true,
      });
      await visit(urls.target);
      await click(selectors.SESSION_RECORDING_SETTINGS_LINK);

      assert.strictEqual(currentURL(), urls.enableSessionRecording);

      const existingStorageBucketId = find(
        selectors.STORAGE_BUCKET_DROPDOWN,
      ).value;

      //disable the toggle, dropdown should be hidden
      await click(selectors.ENABLE_TOGGLE);

      assert.dom(selectors.STORAGE_BUCKET_DROPDOWN).isNotVisible();

      //enable the toggle now,
      //it should have the previously selected storage_bucket_id
      await click(selectors.ENABLE_TOGGLE);

      assert
        .dom(selectors.STORAGE_BUCKET_DROPDOWN)
        .hasValue(existingStorageBucketId);
    });

    test('can assign a storage bucket for the target', async function (assert) {
      featuresService.enable('ssh-session-recording');
      await visit(urls.target);
      await click(selectors.SESSION_RECORDING_ENABLE_BTN);

      assert.strictEqual(currentURL(), urls.enableSessionRecording);

      await click(selectors.ENABLE_TOGGLE);

      assert.dom(selectors.STORAGE_BUCKET_DROPDOWN).hasNoValue();

      await select(selectors.STORAGE_BUCKET_DROPDOWN, storageBucketTwo.id);

      assert.dom(selectors.STORAGE_BUCKET_DROPDOWN).hasValue();

      await click(commonSelectors.SAVE_BTN);

      assert.strictEqual(currentURL(), urls.target);
      assert
        .dom(selectors.BADGE_TEXT)
        .hasText(
          intl.t(
            `resources.storage-bucket.plugin-types.${storageBucketTwo.plugin.name}`,
          ),
        );
      assert.dom(selectors.LINK_LIST_ITEM_TEXT).hasText(storageBucketTwo.name);
    });

    test('can cancel changes to an existing storage bucket selection', async function (assert) {
      featuresService.enable('ssh-session-recording');
      instances.target.update({
        storageBucketId: storageBucketOne.id,
        enable_session_recording: true,
      });

      await visit(urls.target);
      await click(selectors.SESSION_RECORDING_SETTINGS_LINK);

      assert.strictEqual(currentURL(), urls.enableSessionRecording);

      //update the storage bucket selection
      await select(selectors.STORAGE_BUCKET_DROPDOWN, storageBucketTwo);
      await click(commonSelectors.CANCEL_BTN);

      assert.strictEqual(currentURL(), urls.target);
      assert
        .dom(selectors.BADGE_TEXT)
        .hasText(
          intl.t(
            `resources.storage-bucket.plugin-types.${storageBucketOne.plugin.name}`,
          ),
        );
      assert.dom(selectors.LINK_LIST_ITEM_TEXT).hasText(storageBucketOne.name);
    });
  },
);
