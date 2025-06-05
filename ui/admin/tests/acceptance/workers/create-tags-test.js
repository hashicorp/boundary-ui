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
import * as selectors from './selectors';

module('Acceptance | workers | worker | create-tags', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let confirmService;

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
    confirmService = this.owner.lookup('service:confirm');

    await authenticateSession({ username: 'admin' });
  });

  test('visiting worker create tags', async function (assert) {
    await visit(urls.worker);

    await click(selectors.MANAGE_DROPDOWN_WORKER);
    await click(selectors.MANAGE_DROPDOWN_WORKER_CREATE_TAGS);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.createTags);
  });

  test('cannot visit worker create tags without proper permissions', async function (assert) {
    instances.worker.authorized_actions =
      instances.worker.authorized_actions.filter(
        (item) => item !== 'set-worker-tags',
      );
    await visit(urls.worker);

    await click(selectors.MANAGE_DROPDOWN_WORKER);

    assert.dom(selectors.MANAGE_DROPDOWN_WORKER_CREATE_TAGS).doesNotExist();
  });

  test('user can save worker tags', async function (assert) {
    await visit(urls.tags);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 11 });

    await click(selectors.MANAGE_DROPDOWN_WORKER);
    await click(selectors.MANAGE_DROPDOWN_WORKER_CREATE_TAGS);
    await fillIn(selectors.FIELD_KEY, selectors.FIELD_KEY_VALUE);
    await fillIn(selectors.FIELD_VALUE, selectors.FIELD_VALUE_VALUE);
    await click(selectors.ADD_WORKER_TAG_ACTION);
    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 12 });
    assert.strictEqual(currentURL(), urls.tags);
  });

  test('user can cancel tag creation', async function (assert) {
    await visit(urls.worker);

    await click(selectors.MANAGE_DROPDOWN_WORKER);
    await click(selectors.MANAGE_DROPDOWN_WORKER_CREATE_TAGS);
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.tags);
  });

  test('user is prompted to confirm exit when there are unsaved changes', async function (assert) {
    confirmService.enabled = true;
    await visit(urls.createTags);

    await fillIn(selectors.FIELD_KEY, selectors.FIELD_KEY_VALUE);
    await fillIn(selectors.FIELD_VALUE, selectors.FIELD_VALUE_VALUE);
    await click(selectors.ADD_WORKER_TAG_ACTION);
    await click(commonSelectors.HREF(urls.workers));

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN);

    assert.strictEqual(currentURL(), urls.workers);
  });

  test('user can cancel transition when there are unsaved changes', async function (assert) {
    confirmService.enabled = true;
    await visit(urls.createTags);

    await fillIn(selectors.FIELD_KEY, selectors.FIELD_KEY_VALUE);
    await fillIn(selectors.FIELD_VALUE, selectors.FIELD_VALUE_VALUE);
    await click(selectors.ADD_WORKER_TAG_ACTION);
    await click(commonSelectors.HREF(urls.workers));

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.createTags);
  });
});
