/**
 * Copyright IBM Corp. 2021, 2026
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
import { setupApplicationTest } from 'admin/tests/helpers';
import { HCP_MANAGED_KEY } from 'api/models/worker';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | workers | worker | tags', function (hooks) {
  setupApplicationTest(hooks);

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

  hooks.beforeEach(async function () {
    instances.scopes.global = this.server.schema.scopes.find('global');
    instances.worker = this.server.create('worker', {
      scope: instances.scopes.global,
    });
    urls.workers = `/scopes/global/workers`;
    urls.worker = `${urls.workers}/${instances.worker.id}`;
    urls.tags = `${urls.worker}/tags`;
    urls.createTags = `${urls.worker}/create-tags`;
  });

  test('visiting worker tags', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.worker);

    await click(commonSelectors.HREF(urls.tags));

    assert.strictEqual(currentURL(), urls.tags);
    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 11 });
  });

  test('config tags display a tooltip for HCP managed tag', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.worker.config_tags = { [HCP_MANAGED_KEY]: ['true'] };
    await visit(urls.tags);

    await focus(selectors.TABLE_ROW_CONFIG_TAG_TOOLTIP_BUTTON);

    assert
      .dom(selectors.TABLE_ROW_CONFIG_TAG_TOOLTIP_TEXT)
      .hasText(
        'This is a HCP managed worker, you cannot edit or delete this worker’s tags.',
      );
  });

  test('config tags display a tooltip self managed tag', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.tags);

    await focus(selectors.TABLE_ROW_CONFIG_TAG_TOOLTIP_BUTTON);

    assert
      .dom(selectors.TABLE_ROW_CONFIG_TAG_TOOLTIP_TEXT)
      .hasText('To edit config tags, edit them in your worker config file.');
  });

  test('users can remove a specific tag', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.tags);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 11 });

    await click(selectors.TABLE_ROW_API_TAG_ACTION_DROPDOWN);
    await click(selectors.TABLE_ROW_API_TAG_ACTION_DROPDOWN_LAST_BUTTON);

    assert.dom(selectors.MODAL_CONFIRMATION_SAVE_BUTTON).isDisabled();

    await fillIn(selectors.MODAL_CONFIRMATION_FIELD_REMOVE, 'REMOVE');

    assert.dom(selectors.MODAL_CONFIRMATION_CANCEL_BUTTON).isEnabled();

    await click(selectors.MODAL_CONFIRMATION_SAVE_BUTTON);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 10 });
  });

  test('user can cancel tag removal', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.tags);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 11 });

    await click(selectors.TABLE_ROW_API_TAG_ACTION_DROPDOWN);
    await click(selectors.TABLE_ROW_API_TAG_ACTION_DROPDOWN_LAST_BUTTON);

    await click(selectors.MODAL_CONFIRMATION_CANCEL_BUTTON);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 11 });
  });

  test('user cannot remove a tag without proper permission', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.worker.authorized_actions =
      instances.worker.authorized_actions.filter(
        (item) => item !== 'remove-worker-tags',
      );
    await visit(urls.tags);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 11 });

    await click(selectors.TABLE_ROW_API_TAG_ACTION_DROPDOWN);

    // Asserts first button is for editing and there is no second button
    assert
      .dom(selectors.TABLE_ROW_API_TAG_ACTION_DROPDOWN_FIRST_BUTTON)
      .hasText('Edit Tag');
    assert
      .dom(selectors.TABLE_ROW_API_TAG_ACTION_DROPDOWN_LAST_BUTTON)
      .doesNotExist();
  });

  test('users can edit a specific tag', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.tags);
    const key = find(selectors.TABLE_ROW_API_TAG_KEY(4)).textContent.trim();
    const value = find(selectors.TABLE_ROW_API_TAG_VALUE(4)).textContent.trim();

    assert.dom(selectors.TABLE_ROW_API_TAG_KEY(4)).hasText(key);
    assert.dom(selectors.TABLE_ROW_API_TAG_VALUE(4)).hasText(value);

    await click(selectors.TABLE_ROW_API_TAG_ACTION_DROPDOWN);
    await click(selectors.TABLE_ROW_API_TAG_ACTION_DROPDOWN_FIRST_BUTTON);

    await fillIn(selectors.MODAL_EDIT_TAG_FIELD_KEY, 'red');
    await fillIn(selectors.MODAL_EDIT_TAG_FIELD_VALUE, 'blue');

    await click(selectors.MODAL_EDIT_TAG_SAVE_BUTTON);

    assert.dom(selectors.TABLE_ROW_API_TAG_KEY(11)).hasText('red');
    assert.dom(selectors.TABLE_ROW_API_TAG_VALUE(11)).hasText('blue');
  });

  test('users can cancel editing a tag', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.tags);
    const key = find(selectors.TABLE_ROW_API_TAG_KEY(4)).textContent.trim();
    const value = find(selectors.TABLE_ROW_API_TAG_VALUE(4)).textContent.trim();

    assert.dom(selectors.TABLE_ROW_API_TAG_KEY(4)).hasText(key);
    assert.dom(selectors.TABLE_ROW_API_TAG_VALUE(4)).hasText(value);

    await click(selectors.TABLE_ROW_API_TAG_ACTION_DROPDOWN);
    await click(selectors.TABLE_ROW_API_TAG_ACTION_DROPDOWN_FIRST_BUTTON);

    await fillIn(selectors.MODAL_EDIT_TAG_FIELD_KEY, 'red');
    await fillIn(selectors.MODAL_EDIT_TAG_FIELD_VALUE, 'blue');

    await click(selectors.MODAL_EDIT_TAG_CANCEL_BUTTON);

    assert.dom(selectors.TABLE_ROW_API_TAG_KEY(4)).hasText(key);
    assert.dom(selectors.TABLE_ROW_API_TAG_VALUE(4)).hasText(value);
  });

  test('user cannot edit a tag without proper permission', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.worker.authorized_actions =
      instances.worker.authorized_actions.filter(
        (item) => item !== 'set-worker-tags',
      );
    await visit(urls.tags);

    await click(selectors.TABLE_ROW_API_TAG_ACTION_DROPDOWN);

    // Asserts first button is for removing and there is no second button
    assert
      .dom(selectors.TABLE_ROW_API_TAG_ACTION_DROPDOWN_FIRST_BUTTON)
      .hasText('Remove Tag');
    assert
      .dom(selectors.TABLE_ROW_API_TAG_ACTION_DROPDOWN_LAST_BUTTON)
      .doesNotExist();
  });

  test('user does not see tag action dropdown if they cannot edit or remove tags', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.worker.authorized_actions =
      instances.worker.authorized_actions.filter(
        (item) => item !== 'set-worker-tags' && item !== 'remove-worker-tags',
      );

    await visit(urls.tags);

    assert.dom(selectors.TABLE_ROW_API_TAG_ACTION_DROPDOWN).doesNotExist();
  });

  test('shows "No tags added" message when there are no worker tags', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.worker.api_tags = {};
    instances.worker.config_tags = {};
    instances.worker.canonical_tags = {};

    await visit(urls.tags);

    assert.dom(selectors.NO_TAGS_STATE_TITLE).hasText('No tags added');
    assert
      .dom(selectors.NO_TAGS_STATE_ACTION)
      .hasAttribute('href', urls.createTags);
  });
});
