/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import {
  TYPE_HOST_CATALOG_DYNAMIC,
  TYPE_HOST_CATALOG_PLUGIN_GCP,
} from 'api/models/host-catalog';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | host-catalogs | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let getHostCatalogCount;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    hostCatalog: null,
    gcpDynamicHostCatalog: null,
  };
  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    hostCatalogs: null,
    hostCatalog: null,
    gcpDynamicHostCatalog: null,
  };

  hooks.beforeEach(async function () {
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

    instances.gcpDynamicHostCatalog = this.server.create('host-catalog', {
      scope: instances.scopes.project,
      type: TYPE_HOST_CATALOG_DYNAMIC,
      plugin: { name: TYPE_HOST_CATALOG_PLUGIN_GCP },
    });

    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.hostCatalogs = `${urls.projectScope}/host-catalogs`;
    urls.hostCatalog = `${urls.hostCatalogs}/${instances.hostCatalog.id}`;
    urls.gcpDynamicHostCatalog = `${urls.hostCatalogs}/${instances.gcpDynamicHostCatalog.id}`;
    // Generate resource counter
    getHostCatalogCount = () =>
      this.server.schema.hostCatalogs.all().models.length;
    await authenticateSession({});
  });

  test('can delete host catalog', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const hostCatalogCount = getHostCatalogCount();
    await visit(urls.hostCatalogs);

    await click(commonSelectors.HREF(urls.hostCatalog));
    await click(selectors.MANAGE_DROPDOWN_HOST_CATALOG);
    await click(selectors.MANAGE_DROPDOWN_HOST_CATALOG_DELETE);

    assert.strictEqual(getHostCatalogCount(), hostCatalogCount - 1);
  });

  test('can delete GCP host catalog', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const hostCatalogCount = getHostCatalogCount();

    await visit(urls.hostCatalogs);
    await click(commonSelectors.HREF(urls.gcpDynamicHostCatalog));

    await click(selectors.MANAGE_DROPDOWN_HOST_CATALOG);
    await click(selectors.MANAGE_DROPDOWN_HOST_CATALOG_DELETE);

    assert.strictEqual(getHostCatalogCount(), hostCatalogCount - 1);
  });

  test('cannot delete host catalog without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.hostCatalogs);
    instances.hostCatalog.authorized_actions =
      instances.hostCatalog.authorized_actions.filter(
        (item) => item !== 'delete',
      );

    await click(commonSelectors.HREF(urls.hostCatalog));
    await click(selectors.MANAGE_DROPDOWN_HOST_CATALOG);

    assert.dom(selectors.MANAGE_DROPDOWN_HOST_CATALOG_DELETE).doesNotExist();
  });

  test('can accept delete host catalog via dialog', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    const hostCatalogCount = getHostCatalogCount();
    await visit(urls.hostCatalogs);

    await click(commonSelectors.HREF(urls.hostCatalog));
    await click(selectors.MANAGE_DROPDOWN_HOST_CATALOG);
    await click(selectors.MANAGE_DROPDOWN_HOST_CATALOG_DELETE);
    await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('Deleted successfully.');
    assert.strictEqual(getHostCatalogCount(), hostCatalogCount - 1);
    assert.strictEqual(currentURL(), urls.hostCatalogs);
  });

  test('can cancel delete host catalog via dialog', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    const hostCatalogCount = getHostCatalogCount();
    await visit(urls.hostCatalogs);

    await click(commonSelectors.HREF(urls.hostCatalog));
    await click(selectors.MANAGE_DROPDOWN_HOST_CATALOG);
    await click(selectors.MANAGE_DROPDOWN_HOST_CATALOG_DELETE);
    await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);

    assert.strictEqual(getHostCatalogCount(), hostCatalogCount);
    assert.strictEqual(currentURL(), urls.hostCatalog);
  });

  test('deleting a host catalog which errors displays error messages', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

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

    await click(commonSelectors.HREF(urls.hostCatalog));
    await click(selectors.MANAGE_DROPDOWN_HOST_CATALOG);
    await click(selectors.MANAGE_DROPDOWN_HOST_CATALOG_DELETE);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText('Oops.');
  });
});
