/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | workers | worker | create-tags', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const SAVE_BUTTON_SELECTOR = '[type="submit"]';
  const CANCEL_BUTTON_SELECTOR = '.rose-form-actions [type="button"]';
  const MANAGE_DROPDOWN_TOGGLE =
    '[data-test-manage-worker-dropdown] div button';
  const CREATE_TAGS_BUTTON_SELECTOR =
    '[data-test-manage-worker-dropdown] div:first-child a';
  const KEY_INPUT_SELECTOR = '[name="api_tags"] tr td:first-child input';
  const VALUE_INPUT_SELECTOR = '[name="api_tags"] tr td:nth-child(2) input';
  const ADD_INPUT_SELECTOR = '[name="api_tags"] tr td:last-child button';
  const DISCARD_CHANGES_DIALOG = '.rose-dialog';
  const DISCARD_CHANGES_DISCARD_BUTTON =
    '.rose-dialog-footer .rose-button-primary';
  const DISCARD_CHANGES_CANCEL_BUTTON =
    '.rose-dialog-footer .rose-button-secondary';

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

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    const scope = instances.scopes.global;
    instances.worker = this.server.create('worker', {
      scopeId: scope.id,
      // authorized_actions: [],
    });
    urls.workers = `/scopes/global/workers`;
    urls.worker = `${urls.workers}/${instances.worker.id}`;
    urls.tags = `${urls.worker}/tags`;
    urls.createTags = `${urls.worker}/create-tags`;

    authenticateSession({});
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

    await click(CANCEL_BUTTON_SELECTOR);

    assert.dom(DISCARD_CHANGES_DIALOG).isVisible();

    await click(DISCARD_CHANGES_DISCARD_BUTTON);

    assert.strictEqual(currentURL(), urls.tags);
  });

  test('user can cancel transition when there are unsaved changes', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    await visit(urls.createTags);
    await fillIn(KEY_INPUT_SELECTOR, 'key');
    await fillIn(VALUE_INPUT_SELECTOR, 'value');
    await click(ADD_INPUT_SELECTOR);

    await click(CANCEL_BUTTON_SELECTOR);

    assert.dom(DISCARD_CHANGES_DIALOG).isVisible();

    await click(DISCARD_CHANGES_CANCEL_BUTTON);

    assert.strictEqual(currentURL(), urls.createTags);
  });
});
