/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';

module('Acceptance | host-catalogs | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let getHostCatalogCount;
  const MANAGE_DROPDOWN_SELECTOR =
    '[data-test-manage-host-catalogs-dropdown] button:first-child';
  const DELETE_ACTION_SELECTOR =
    '[data-test-manage-host-catalogs-dropdown] ul li button';

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    hostCatalog: null,
  };
  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    hostCatalogs: null,
    hostCatalog: null,
  };

  hooks.beforeEach(function () {
    // Generate resources
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.hostCatalog = this.server.create('host-catalog', {
      scope: instances.scopes.project,
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.hostCatalogs = `${urls.projectScope}/host-catalogs`;
    urls.hostCatalog = `${urls.hostCatalogs}/${instances.hostCatalog.id}`;
    // Generate resource counter
    getHostCatalogCount = () =>
      this.server.schema.hostCatalogs.all().models.length;
    authenticateSession({});
  });

  test('can delete host catalog', async function (assert) {
    const hostCatalogCount = getHostCatalogCount();

    await visit(urls.hostCatalogs);
    await click(`[href="${urls.hostCatalog}"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);

    assert.strictEqual(getHostCatalogCount(), hostCatalogCount - 1);
  });

  test('cannot delete host catalog without proper authorization', async function (assert) {
    await visit(urls.hostCatalogs);
    instances.hostCatalog.authorized_actions =
      instances.hostCatalog.authorized_actions.filter(
        (item) => item !== 'delete',
      );

    await click(`[href="${urls.hostCatalog}"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);

    assert.dom(DELETE_ACTION_SELECTOR).doesNotExist();
  });

  test('can accept delete host catalog via dialog', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    const hostCatalogCount = getHostCatalogCount();
    await visit(urls.hostCatalogs);

    await click(`[href="${urls.hostCatalog}"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);
    await click('.rose-dialog .rose-button-primary');

    assert.dom('.rose-notification-body').hasText('Deleted successfully.');
    assert.strictEqual(getHostCatalogCount(), hostCatalogCount - 1);
    assert.strictEqual(currentURL(), urls.hostCatalogs);
  });

  test('can cancel delete host catalog via dialog', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    const hostCatalogCount = getHostCatalogCount();
    await visit(urls.hostCatalogs);

    await click(`[href="${urls.hostCatalog}"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);
    await click('.rose-dialog .rose-button-secondary');

    assert.strictEqual(getHostCatalogCount(), hostCatalogCount);
    assert.strictEqual(currentURL(), urls.hostCatalog);
  });

  test('deleting a host catalog which errors displays error messages', async function (assert) {
    await visit(urls.hostCatalogs);
    this.server.del('/host-catalogs/:id', () => {
      return new Response(
        490,
        {},
        {
          status: 490,
          code: 'error',
          message: 'Oops.',
        },
      );
    });

    await click(`[href="${urls.hostCatalog}"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);

    assert.dom('.rose-notification-body').hasText('Oops.');
  });
});
