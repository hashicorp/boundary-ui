/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
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

  const instances = {
    scopes: {
      global: null,
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
    instances.worker = this.server.create('worker', {
      scope: instances.scopes.global,
    });
    // Generate route URLs for resources
    urls.globalScope = '/scopes/global';
    urls.workers = `${urls.globalScope}/workers`;
    urls.worker = `${urls.workers}/${instances.worker.id}`;
    authenticateSession({});
  });

  test('visiting workers', async function (assert) {
    assert.expect(1);
    await visit(urls.workers);
    await a11yAudit();
    assert.dom(`[href="${urls.workers}"]`).isVisible();
  });

  test('cannot navigate to an worker form without proper authorization', async function (assert) {
    assert.expect(1);
    instances.worker.authorized_actions =
      instances.worker.authorized_actions.filter((itm) => itm !== 'read');
    await visit(urls.workers);
    await a11yAudit();
    assert
      .dom('main tbody .rose-table-header-cell:nth-child(1) a')
      .isNotVisible();
  });

  test('can navigate to an worker form with proper authorization', async function (assert) {
    assert.expect(1);
    await visit(urls.workers);
    await a11yAudit();
    assert.dom('main tbody .rose-table-header-cell:nth-child(1) a').isVisible();
  });
});
