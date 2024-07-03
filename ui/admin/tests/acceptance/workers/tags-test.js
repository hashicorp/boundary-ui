/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, focus } from '@ember/test-helpers';
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
    const scope = instances.scopes.global;
    instances.worker = this.server.create('worker', { scopeId: scope.id });
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
      .hasText('To edit config tags, edit them in your worker config file');
  });
});
