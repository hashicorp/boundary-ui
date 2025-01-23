/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | workers | worker | create-tags', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const SAVE_BUTTON_SELECTOR = '[type="submit"]';
  const CANCEL_BUTTON_SELECTOR = '.rose-form-actions [type="button"]';
  const MANAGE_DROPDOWN_TOGGLE =
    '[data-test-manage-worker-dropdown] button:first-child';
  const CREATE_TAGS_BUTTON_SELECTOR =
    '[data-test-manage-worker-dropdown] ul a:first-child';
  const KEY_INPUT_SELECTOR = '[name="api_tags"] tr td:first-child input';
  const VALUE_INPUT_SELECTOR = '[name="api_tags"] tr td:nth-child(2) input';
  const ADD_INPUT_SELECTOR = '[name="api_tags"] tr td:last-child button';

  const instances = {
    scopes: {
      global: null,
    },
    worker: null,
  };

  const urls = {
    workers: null,
    worker: null,
    tags: null,
    createTags: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.worker = this.server.create('worker', {
      scope: instances.scopes.global,
    });
    urls.workers = `/scopes/global/workers`;
    urls.worker = `${urls.workers}/${instances.worker.id}`;
    urls.tags = `${urls.worker}/tags`;
    urls.createTags = `${urls.worker}/create-tags`;

    await authenticateSession({ username: 'admin' });
  });

  test('visiting worker create tags', async function (assert) {
    await visit(urls.worker);

    await click(MANAGE_DROPDOWN_TOGGLE);
    await click(CREATE_TAGS_BUTTON_SELECTOR);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.createTags);
  });

  test('cannot visit worker create tags without proper permissions', async function (assert) {
    instances.worker.authorized_actions =
      instances.worker.authorized_actions.filter(
        (item) => item !== 'set-worker-tags',
      );
    await visit(urls.worker);

    await click(MANAGE_DROPDOWN_TOGGLE);

    assert.dom(CREATE_TAGS_BUTTON_SELECTOR).doesNotExist();
  });

  test('user can save worker tags', async function (assert) {
    await visit(urls.tags);

    assert.dom('tbody tr').exists({ count: 11 });

    await click(MANAGE_DROPDOWN_TOGGLE);
    await click(CREATE_TAGS_BUTTON_SELECTOR);
    await fillIn(KEY_INPUT_SELECTOR, 'key');
    await fillIn(VALUE_INPUT_SELECTOR, 'value');
    await click(ADD_INPUT_SELECTOR);

    await click(SAVE_BUTTON_SELECTOR);

    assert.dom('tbody tr').exists({ count: 12 });
    assert.strictEqual(currentURL(), urls.tags);
  });

  test('user can cancel tag creation', async function (assert) {
    await visit(urls.worker);

    await click(MANAGE_DROPDOWN_TOGGLE);
    await click(CREATE_TAGS_BUTTON_SELECTOR);

    await click(CANCEL_BUTTON_SELECTOR);

    assert.strictEqual(currentURL(), urls.tags);
  });

  test('user is prompted to confirm exit when there are unsaved changes', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    await visit(urls.createTags);
    await fillIn(KEY_INPUT_SELECTOR, 'key');
    await fillIn(VALUE_INPUT_SELECTOR, 'value');
    await click(ADD_INPUT_SELECTOR);

    await click(`[href="${urls.workers}"]`);

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN);

    assert.strictEqual(currentURL(), urls.workers);
  });

  test('user can cancel transition when there are unsaved changes', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    await visit(urls.createTags);
    await fillIn(KEY_INPUT_SELECTOR, 'key');
    await fillIn(VALUE_INPUT_SELECTOR, 'value');
    await click(ADD_INPUT_SELECTOR);

    await click(`[href="${urls.workers}"]`);

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.createTags);
  });
});
