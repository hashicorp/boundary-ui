/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, find, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { TYPE_TARGET_SSH } from 'api/models/target';
import select from '@ember/test-helpers/dom/select';

module('Acceptance | targets | enable session recording', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let featuresService;
  let storageBucketOne;
  let storageBucketTwo;

  const SETTINGS_LINK_SELECTOR = '.target-sidebar .hds-link-standalone';
  const ENABLE_BUTTON_SELECTOR = '.target-sidebar .hds-button';
  const DROPDOWN_SELECTOR = '[name=storage_bucket_id]';
  const LINK_LIST_SELECTOR = '.link-list-item';
  const LINK_LIST_SELECTOR_ITEM_TEXT = '.link-list-item__text';
  const TOGGLE_SELECTOR = '[name=target-enable-session-recording]';
  const LINK_TO_NEW_STORAGE_BUCKET =
    '.enable-session-recording-toggle .hds-link-standalone';
  const SAVE_BTN_SELECTOR = '.rose-form-actions .rose-button-primary';
  const CANCEL_BTN_SELECTOR = '.rose-form-actions .rose-button-secondary';

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
    globalScope: null,
    orgScope: null,
    projectScope: null,
    targets: null,
    target: null,
    enableSessionRecording: null,
    storageBuckets: null,
    newStorageBucket: null,
  };

  hooks.beforeEach(function () {
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
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    urls.target = `${urls.targets}/${instances.target.id}`;
    urls.enableSessionRecording = `${urls.target}/enable-session-recording`;
    urls.storageBuckets = `${urls.projectScope}/storage-buckets`;
    urls.newStorageBucket = `${urls.storageBuckets}/new`;
    urls.storageBucket = `${urls.storageBuckets}/${storageBucketOne.id}`;

    authenticateSession({});
  });

  test('cannot enable session recording for a target without proper authorization', async function (assert) {
    assert.expect(2);
    assert.false(featuresService.isEnabled('session-recording'));
    await visit(urls.target);
    await a11yAudit();
    assert.dom('.target-sidebar a').doesNotExist();
  });

  test('users can click on enable-recording button in target session-recording sidebar and it takes them to enable session recording', async function (assert) {
    featuresService.enable('session-recording');
    assert.expect(2);
    await visit(urls.target);
    assert.dom(SETTINGS_LINK_SELECTOR).doesNotExist();
    await click(ENABLE_BUTTON_SELECTOR);
    assert.strictEqual(currentURL(), urls.enableSessionRecording);
  });

  test('users can click on settings link in target session-recording sidebar and it takes them to enable session recording', async function (assert) {
    featuresService.enable('session-recording');
    assert.expect(1);
    instances.target.update({
      storageBucketId: storageBucketOne.id,
    });
    await visit(urls.target);
    await click(SETTINGS_LINK_SELECTOR);
    assert.strictEqual(currentURL(), urls.enableSessionRecording);
  });

  test('users can click on associated storage bucket card on an ssh target', async function (assert) {
    featuresService.enable('session-recording');
    assert.expect(1);
    instances.target.update({ storageBucketId: storageBucketOne.id });
    await visit(urls.target);
    await click(LINK_LIST_SELECTOR);
    assert.strictEqual(currentURL(), urls.storageBucket);
  });

  test('toggle should be enabled and storage buckets list should be shown when enable session recording button is clicked', async function (assert) {
    featuresService.enable('session-recording');
    assert.expect(3);
    await visit(urls.target);
    await click(ENABLE_BUTTON_SELECTOR);
    assert.strictEqual(currentURL(), urls.enableSessionRecording);
    assert.dom(TOGGLE_SELECTOR).isVisible();
    assert.dom(DROPDOWN_SELECTOR).isVisible();
  });

  test('storage buckets list is hidden when toggle is disabled', async function (assert) {
    featuresService.enable('session-recording');
    assert.expect(4);
    await visit(urls.target);
    await click(ENABLE_BUTTON_SELECTOR);
    assert.strictEqual(currentURL(), urls.enableSessionRecording);
    assert.dom(TOGGLE_SELECTOR).isVisible();
    assert.dom(DROPDOWN_SELECTOR).isVisible();
    await click(TOGGLE_SELECTOR);
    assert.dom(DROPDOWN_SELECTOR).isNotVisible();
  });

  test('link to add new storage bucket should be displayed and redirect to new storage buckets form', async function (assert) {
    featuresService.enable('session-recording');
    assert.expect(3);
    await visit(urls.target);
    await click(ENABLE_BUTTON_SELECTOR);
    assert.strictEqual(currentURL(), urls.enableSessionRecording);
    assert.dom(LINK_TO_NEW_STORAGE_BUCKET).isVisible();
    await click(LINK_TO_NEW_STORAGE_BUCKET);
    assert.strictEqual(currentURL(), urls.newStorageBucket);
  });

  test('retain last selected dropdown list value when the toggle is off', async function (assert) {
    featuresService.enable('session-recording');
    assert.expect(3);
    instances.target.update({
      storageBucketId: storageBucketOne.id,
    });
    await visit(urls.target);
    await click(SETTINGS_LINK_SELECTOR);
    assert.strictEqual(currentURL(), urls.enableSessionRecording);

    const existingStorageBucketId = find(DROPDOWN_SELECTOR).value;

    //disable the toggle, dropdown should be hidden
    await click(TOGGLE_SELECTOR);
    assert.dom(DROPDOWN_SELECTOR).isNotVisible();

    //enable the toggle now,
    //it should have the previously selected storage_bucket_id
    await click(TOGGLE_SELECTOR);
    assert.dom(DROPDOWN_SELECTOR).hasValue(existingStorageBucketId);
  });

  test('can assign a storage bucket for the target', async function (assert) {
    featuresService.enable('session-recording');
    assert.expect(5);
    await visit(urls.target);
    await click(ENABLE_BUTTON_SELECTOR);
    assert.strictEqual(currentURL(), urls.enableSessionRecording);
    assert.dom(DROPDOWN_SELECTOR).hasNoValue();

    await select(DROPDOWN_SELECTOR, storageBucketTwo.id);
    assert.dom(DROPDOWN_SELECTOR).hasValue();

    await click(SAVE_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.target);

    assert.strictEqual(
      find(LINK_LIST_SELECTOR_ITEM_TEXT).textContent.trim(),
      storageBucketTwo.name
    );
  });

  test('can cancel changes to an exisiting storage bucket selection', async function (assert) {
    featuresService.enable('session-recording');
    assert.expect(3);
    instances.target.update({
      storageBucketId: storageBucketOne.id,
    });

    await visit(urls.target);
    await click(SETTINGS_LINK_SELECTOR);
    assert.strictEqual(currentURL(), urls.enableSessionRecording);

    //update the storage bucket selection
    await select(DROPDOWN_SELECTOR, storageBucketTwo);

    await click(CANCEL_BTN_SELECTOR);
    assert.strictEqual(currentURL(), urls.target);

    assert.strictEqual(
      find(LINK_LIST_SELECTOR_ITEM_TEXT).textContent.trim(),
      storageBucketOne.name
    );
  });
});
