/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, focus, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | workers | worker | tags', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const CONFIG_TAG_TOOLTIP_SELECTOR =
    'tbody tr:first-child td:nth-child(3) button';
  const CONFIG_TAG_TOOLTIP_TEXT_SELECTOR =
    'tbody tr:first-child td:nth-child(3) > div';
  const API_TAG_ACTION_SELECTOR =
    'tbody tr:nth-child(4) td:nth-child(4) button';
  const API_TAG_REMOVE_ACTION_SELECTOR =
    'tbody tr:nth-child(4) td:nth-child(4) ul li button';
  const REMOVE_TAG_REMOVE_SELECTOR = '.remove-tag-modal input';
  const REMOVE_TAG_REMOVE_BUTTON_SELECTOR =
    '.remove-tag-modal button:first-child';
  const REMOVE_TAG_CANCEL_BUTTON_SELECTOR =
    '.remove-tag-modal button:last-child';

  const instances = {
    scopes: {
      global: null,
    },
  };

  const urls = {
    workers: null,
    worker: null,
    tags: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.worker = this.server.create('worker', {
      scope: instances.scopes.global,
    });
    urls.workers = `/scopes/global/workers`;
    urls.worker = `${urls.workers}/${instances.worker.id}`;
    urls.tags = `${urls.worker}/tags`;
    authenticateSession({});
  });

  test('visiting worker tags', async function (assert) {
    await visit(urls.worker);
    await click(`[href="${urls.tags}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.tags);
    assert.dom('tbody tr').exists({ count: 11 });
  });

  test('config tags display a tooltip', async function (assert) {
    await visit(urls.tags);
    await a11yAudit();

    await focus(CONFIG_TAG_TOOLTIP_SELECTOR);

    assert
      .dom(CONFIG_TAG_TOOLTIP_TEXT_SELECTOR)
      .hasText('To edit config tags, edit them in your worker config file.');
  });

  test('users can remove a specific tag', async function (assert) {
    await visit(urls.tags);

    assert.dom('tbody tr').exists({ count: 11 });

    await click(API_TAG_ACTION_SELECTOR);
    await click(API_TAG_REMOVE_ACTION_SELECTOR);

    assert.dom(REMOVE_TAG_REMOVE_BUTTON_SELECTOR).isDisabled();

    await fillIn(REMOVE_TAG_REMOVE_SELECTOR, 'REMOVE');

    assert.dom(REMOVE_TAG_REMOVE_BUTTON_SELECTOR).isEnabled();

    await click(REMOVE_TAG_REMOVE_BUTTON_SELECTOR);

    assert.dom('tbody tr').exists({ count: 10 });
  });

  test('user can cancel tag removal', async function (assert) {
    await visit(urls.tags);

    assert.dom('tbody tr').exists({ count: 11 });

    await click(API_TAG_ACTION_SELECTOR);
    await click(API_TAG_REMOVE_ACTION_SELECTOR);

    await click(REMOVE_TAG_CANCEL_BUTTON_SELECTOR);

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

    assert.dom(API_TAG_REMOVE_ACTION_SELECTOR).doesNotExist();
  });
});
