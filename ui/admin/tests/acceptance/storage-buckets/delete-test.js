/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */
import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';

module('Acceptance | storage-buckets | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let intl;
  let features;
  let getStorageBucketCount;

  const DROPDOWN_BUTTON_SELECTOR = '.hds-dropdown-toggle-icon';
  const DELETE_DROPDOWN_SELECTOR = '.hds-dropdown-list-item [type="button"]';
  const DIALOG_DELETE_BTN_SELECTOR = '.rose-dialog .rose-button-primary';
  const DIALOG_CANCEL_BTN_SELECTOR = '.rose-dialog .rose-button-secondary';
  const DIALOG_MESSAGE_SELECTOR = '.rose-dialog-body';
  const DIALOG_TITLE_SELECTOR = '.rose-dialog-header';
  const NOTIFICATION_MSG_SELECTOR =
    '[data-test-toast-notification] .hds-alert__description';
  const NOTIFICATION_MSG_TEXT = 'Deleted successfully.';

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    storageBucket: null,
  };

  const urls = {
    globalScope: null,
    storageBuckets: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.storageBucket = this.server.create('storage-bucket', {
      scope: instances.scopes.global,
    });
    urls.globalScope = `/scopes/global`;
    urls.storageBuckets = `${urls.globalScope}/storage-buckets`;
    getStorageBucketCount = () =>
      this.server.schema.storageBuckets.all().models.length;

    await authenticateSession({});
    intl = this.owner.lookup('service:intl');
    features = this.owner.lookup('service:features');
    features.enable('ssh-session-recording');
  });

  test('user can delete a storage bucket', async function (assert) {
    const storageBucketCount = getStorageBucketCount();
    await visit(urls.globalScope);
    assert.true(instances.storageBucket.authorized_actions.includes('delete'));
    await click(`[href="${urls.storageBuckets}"]`);
    await click(DROPDOWN_BUTTON_SELECTOR);
    await click(DELETE_DROPDOWN_SELECTOR);

    assert.strictEqual(currentURL(), urls.storageBuckets);
    assert.strictEqual(getStorageBucketCount(), storageBucketCount - 1);
  });

  test('user can accept delete storage bucket via dialog', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    const storageBucketCount = getStorageBucketCount();
    await visit(urls.globalScope);

    await click(`[href="${urls.storageBuckets}"]`);
    await click(DROPDOWN_BUTTON_SELECTOR);
    await click(DELETE_DROPDOWN_SELECTOR);

    assert
      .dom(DIALOG_DELETE_BTN_SELECTOR)
      .hasText(intl.t('resources.storage-bucket.actions.delete'));

    await click(DIALOG_DELETE_BTN_SELECTOR);

    assert.dom(NOTIFICATION_MSG_SELECTOR).hasText(NOTIFICATION_MSG_TEXT);
    assert.strictEqual(currentURL(), urls.storageBuckets);
    assert.strictEqual(getStorageBucketCount(), storageBucketCount - 1);
  });

  test('user can cancel delete storage bucket via dialog', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    const storageBucketCount = getStorageBucketCount();
    await visit(urls.globalScope);

    await click(`[href="${urls.storageBuckets}"]`);
    await click(DROPDOWN_BUTTON_SELECTOR);
    await click(DELETE_DROPDOWN_SELECTOR);

    assert
      .dom(DIALOG_TITLE_SELECTOR)
      .hasText(
        intl.t(
          'resources.storage-bucket.questions.delete-storage-bucket.title',
        ),
      );
    assert
      .dom(DIALOG_MESSAGE_SELECTOR)
      .hasText(
        intl.t(
          'resources.storage-bucket.questions.delete-storage-bucket.message',
        ),
      );

    await click(DIALOG_CANCEL_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.storageBuckets);
    assert.strictEqual(getStorageBucketCount(), storageBucketCount);
  });

  test('user cannot delete storage bucket without proper authorization', async function (assert) {
    await visit(urls.globalScope);
    instances.storageBucket.authorized_actions =
      instances.storageBucket.authorized_actions.filter(
        (item) => item !== 'delete',
      );

    await click(`[href="${urls.storageBuckets}"]`);
    await click(DROPDOWN_BUTTON_SELECTOR);

    assert.dom(DELETE_DROPDOWN_SELECTOR).doesNotExist();
  });

  test('deleting a storage bucket which errors displays error messages', async function (assert) {
    await visit(urls.globalScope);
    this.server.del('/storage-buckets/:id', () => {
      return new Response(
        490,
        {},
        {
          status: 490,
          code: 'error',
          message: 'Oops.',
        },
      );
    });

    await click(`[href="${urls.storageBuckets}"]`);
    await click(DROPDOWN_BUTTON_SELECTOR);
    await click(DELETE_DROPDOWN_SELECTOR);

    assert.dom(NOTIFICATION_MSG_SELECTOR).hasText('Oops.');
  });
});
