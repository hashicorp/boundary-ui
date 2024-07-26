/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  click,
  focus,
  fillIn,
  find,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { HCP_MANAGED_KEY } from 'api/models/worker';

module('Acceptance | workers | worker | tags', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const CONFIG_TAG_TOOLTIP_SELECTOR =
    'tbody tr:first-child td:nth-child(3) button';
  const CONFIG_TAG_TOOLTIP_TEXT_SELECTOR =
    'tbody tr:first-child td:nth-child(3) > div';
  const API_TAG_KEY_SELECTOR = (row) =>
    `tbody tr:nth-child(${row}) td:first-child pre`;
  const API_TAG_VALUE_SELECTOR = (row) =>
    `tbody tr:nth-child(${row}) td:nth-child(2) pre`;
  const API_TAG_ACTION_SELECTOR =
    'tbody tr:nth-child(4) td:nth-child(4) button';
  const API_TAG_FIRST_BUTTON_SELECTOR =
    'tbody tr:nth-child(4) td:nth-child(4) ul li:first-child button';
  const API_TAG_LAST_BUTTON_SELECTOR =
    'tbody tr:nth-child(4) td:nth-child(4) ul li:nth-child(2) button';
  const EDIT_TAG_KEY_INPUT_SELECTOR =
    '[data-test-edit-modal] [name="edit-tag-key"]';
  const EDIT_TAG_VALUE_INPUT_SELECTOR =
    '[data-test-edit-modal] [name="edit-tag-value"]';
  const EDIT_TAG_CONFIRM_BUTTON = '[data-test-edit-modal] button:first-child';
  const EDIT_TAG_CANCEL_BUTTON = '[data-test-edit-modal] button:last-child';
  const CONFIRMATION_MODAL_INPUT_SELECTOR =
    '[data-test-confirmation-modal] input';
  const CONFIRMATION_MODAL_REMOVE_BUTTON_SELECTOR =
    '[data-test-confirmation-modal] button:first-child';
  const CONFIRMATION_MODAL_CANCEL_BUTTON_SELECTOR =
    '[data-test-confirmation-modal] button:last-child';
  const NO_TAGS_STATE_TITLE = '[data-test-no-tags] div:first-child';
  const NO_TAGS_STATE_ACTION = '[data-test-no-tags] div:nth-child(3) a';

  const instances = {
    scopes: {
      global: null,
    },
  };

  const urls = {
    workers: null,
    worker: null,
    tags: null,
    createTags: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.worker = this.server.create('worker', {
      scope: instances.scopes.global,
    });
    urls.workers = `/scopes/global/workers`;
    urls.worker = `${urls.workers}/${instances.worker.id}`;
    urls.tags = `${urls.worker}/tags`;
    urls.createTags = `${urls.worker}/create-tags`;
    authenticateSession({});
  });

  test('visiting worker tags', async function (assert) {
    await visit(urls.worker);
    await click(`[href="${urls.tags}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.tags);
    assert.dom('tbody tr').exists({ count: 11 });
  });

  test('config tags display a tooltip for HCP managed tag', async function (assert) {
    instances.worker.config_tags = { [HCP_MANAGED_KEY]: ['true'] };
    await visit(urls.tags);

    await focus(CONFIG_TAG_TOOLTIP_SELECTOR);

    assert
      .dom(CONFIG_TAG_TOOLTIP_TEXT_SELECTOR)
      .hasText(
        'This is a HCP managed worker, you cannot edit or delete this worker’s tags.',
      );
  });

  test('config tags display a tooltip self managed tag', async function (assert) {
    await visit(urls.tags);

    await focus(CONFIG_TAG_TOOLTIP_SELECTOR);

    assert
      .dom(CONFIG_TAG_TOOLTIP_TEXT_SELECTOR)
      .hasText('To edit config tags, edit them in your worker config file.');
  });

  test('users can remove a specific tag', async function (assert) {
    await visit(urls.tags);

    assert.dom('tbody tr').exists({ count: 11 });

    await click(API_TAG_ACTION_SELECTOR);
    await click(API_TAG_LAST_BUTTON_SELECTOR);

    assert.dom(CONFIRMATION_MODAL_REMOVE_BUTTON_SELECTOR).isDisabled();

    await fillIn(CONFIRMATION_MODAL_INPUT_SELECTOR, 'REMOVE');

    assert.dom(CONFIRMATION_MODAL_REMOVE_BUTTON_SELECTOR).isEnabled();

    await click(CONFIRMATION_MODAL_REMOVE_BUTTON_SELECTOR);

    assert.dom('tbody tr').exists({ count: 10 });
  });

  test('user can cancel tag removal', async function (assert) {
    await visit(urls.tags);

    assert.dom('tbody tr').exists({ count: 11 });

    await click(API_TAG_ACTION_SELECTOR);
    await click(API_TAG_LAST_BUTTON_SELECTOR);

    await click(CONFIRMATION_MODAL_CANCEL_BUTTON_SELECTOR);

    assert.dom('tbody tr').exists({ count: 11 });
  });

  test('user cannot remove a tag without proper permission', async function (assert) {
    instances.worker.authorized_actions =
      instances.worker.authorized_actions.filter(
        (item) => item !== 'remove-worker-tags',
      );
    await visit(urls.tags);

    assert.dom('tbody tr').exists({ count: 11 });

    await click(API_TAG_ACTION_SELECTOR);

    // Asserts first button is for editing and there is no second button
    assert.dom(API_TAG_FIRST_BUTTON_SELECTOR).hasText('Edit Tag');
    assert.dom(API_TAG_LAST_BUTTON_SELECTOR).doesNotExist();
  });

  test('users can edit a specific tag', async function (assert) {
    await visit(urls.tags);
    const key = find(API_TAG_KEY_SELECTOR(4)).textContent.trim();
    const value = find(API_TAG_VALUE_SELECTOR(4)).textContent.trim();

    assert.dom(API_TAG_KEY_SELECTOR(4)).hasText(key);
    assert.dom(API_TAG_VALUE_SELECTOR(4)).hasText(value);

    await click(API_TAG_ACTION_SELECTOR);
    await click(API_TAG_FIRST_BUTTON_SELECTOR);

    await fillIn(EDIT_TAG_KEY_INPUT_SELECTOR, 'red');
    await fillIn(EDIT_TAG_VALUE_INPUT_SELECTOR, 'blue');

    await click(EDIT_TAG_CONFIRM_BUTTON);

    assert.dom(API_TAG_KEY_SELECTOR(11)).hasText('red');
    assert.dom(API_TAG_VALUE_SELECTOR(11)).hasText('blue');
  });

  test('users can cancel editing a tag', async function (assert) {
    await visit(urls.tags);
    const key = find(API_TAG_KEY_SELECTOR(4)).textContent.trim();
    const value = find(API_TAG_VALUE_SELECTOR(4)).textContent.trim();

    assert.dom(API_TAG_KEY_SELECTOR(4)).hasText(key);
    assert.dom(API_TAG_VALUE_SELECTOR(4)).hasText(value);

    await click(API_TAG_ACTION_SELECTOR);
    await click(API_TAG_FIRST_BUTTON_SELECTOR);

    await fillIn(EDIT_TAG_KEY_INPUT_SELECTOR, 'red');
    await fillIn(EDIT_TAG_VALUE_INPUT_SELECTOR, 'blue');

    await click(EDIT_TAG_CANCEL_BUTTON);

    assert.dom(API_TAG_KEY_SELECTOR(4)).hasText(key);
    assert.dom(API_TAG_VALUE_SELECTOR(4)).hasText(value);
  });

  test('user cannot edit a tag without proper permission', async function (assert) {
    instances.worker.authorized_actions =
      instances.worker.authorized_actions.filter(
        (item) => item !== 'set-worker-tags',
      );
    await visit(urls.tags);

    await click(API_TAG_ACTION_SELECTOR);

    // Asserts first button is for removing and there is no second button
    assert.dom(API_TAG_FIRST_BUTTON_SELECTOR).hasText('Remove Tag');
    assert.dom(API_TAG_LAST_BUTTON_SELECTOR).doesNotExist();
  });

  test('user does not see tag action dropdown if they cannot edit or remove tags', async function (assert) {
    instances.worker.authorized_actions =
      instances.worker.authorized_actions.filter(
        (item) => item !== 'set-worker-tags' && item !== 'remove-worker-tags',
      );

    await visit(urls.tags);

    assert.dom(API_TAG_ACTION_SELECTOR).doesNotExist();
  });

  test('shows "No tags added" message when there are no worker tags', async function (assert) {
    instances.worker.api_tags = {};
    instances.worker.config_tags = {};
    instances.worker.canonical_tags = {};

    await visit(urls.tags);

    assert.dom(NO_TAGS_STATE_TITLE).hasText('No tags added');
    assert.dom(NO_TAGS_STATE_ACTION).hasAttribute('href', urls.createTags);
  });
});
