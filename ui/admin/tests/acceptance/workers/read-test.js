/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | workers | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let featuresService;

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    worker: null,
  };

  const urls = {
    globalScope: null,
    workers: null,
    worker: null,
  };

  hooks.beforeEach(function () {
    //Generate the resources
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.worker = this.server.create('worker', {
      scope: instances.scopes.global,
    });
    // Generate route URLs for resources
    urls.globalScope = '/scopes/global';
    urls.workers = `${urls.globalScope}/workers`;
    urls.worker = `${urls.workers}/${instances.worker.id}`;

    featuresService = this.owner.lookup('service:features');
    featuresService.enable('byow');
    authenticateSession({});
  });

  test('visiting worker', async function (assert) {
    assert.expect(1);
    await visit(urls.workers);
    await a11yAudit();

    await click(`[href="${urls.worker}"]`);

    assert.strictEqual(currentURL(), urls.worker);
  });

  test('cannot navigate to an worker form without proper authorization', async function (assert) {
    assert.expect(1);
    instances.worker.authorized_actions =
      instances.worker.authorized_actions.filter((itm) => itm !== 'read');
    await visit(urls.globalScope);

    await click(`[href="${urls.workers}"]`);

    assert
      .dom('main tbody .rose-table-header-cell:nth-child(1) a')
      .isNotVisible();
  });

  test('can navigate to an worker form with proper authorization', async function (assert) {
    assert.expect(1);
    await visit(urls.globalScope);

    await click(`[href="${urls.workers}"]`);

    assert.dom('main tbody .rose-table-header-cell:nth-child(1) a').isVisible();
  });
});
