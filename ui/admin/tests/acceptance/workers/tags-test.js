/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | workers | tags', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

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
    assert.strictEqual(findAll('tbody tr').length, 1);
  });
});
