/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, click, fillIn, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import {
  TYPE_HOST_CATALOG_DYNAMIC,
  TYPE_HOST_CATALOG_STATIC,
  TYPE_HOST_CATALOG_PLUGIN_AWS,
  TYPE_HOST_CATALOG_PLUGIN_AZURE,
} from 'api/models/host-catalog';

module('Acceptance | host-catalogs | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    staticHostCatalog: null,
  };

  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    hostCatalogs: null,
    staticHostCatalog: null,
  };

  const SEARCH_INPUT_SELECTOR = '.search-filtering [type="search"]';
  const NO_RESULTS_MSG_SELECTOR = '[data-test-no-host-catalog-results]';

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.staticHostCatalog = this.server.create('host-catalog', {
      scope: instances.scopes.project,
      type: TYPE_HOST_CATALOG_STATIC,
    });
    instances.awsHostCatalog = this.server.create('host-catalog', {
      scope: instances.scopes.project,
      type: TYPE_HOST_CATALOG_DYNAMIC,
      plugin: { name: TYPE_HOST_CATALOG_PLUGIN_AWS },
    });
    instances.azureHostCatalog = this.server.create('host-catalog', {
      scope: instances.scopes.project,
      type: TYPE_HOST_CATALOG_DYNAMIC,
      plugin: { name: TYPE_HOST_CATALOG_PLUGIN_AZURE },
    });
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.hostCatalogs = `${urls.projectScope}/host-catalogs`;
    urls.staticHostCatalog = `${urls.hostCatalogs}/${instances.staticHostCatalog.id}`;
    urls.awsHostCatalog = `${urls.hostCatalogs}/${instances.awsHostCatalog.id}`;
    urls.azureHostCatalog = `${urls.hostCatalogs}/${instances.azureHostCatalog.id}`;

    authenticateSession({});
  });

  test('user can navigate to host catalogs with proper authorization', async function (assert) {
    await visit(urls.orgScope);
    await click(`[href="${urls.projectScope}"]`);

    assert.true(
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].includes('list'),
    );
    assert.true(
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].includes('create'),
    );
    assert.dom(`[href="${urls.hostCatalogs}"]`).exists();
  });

  test('user cannot navigate to index without either list or create actions', async function (assert) {
    instances.scopes.project.authorized_collection_actions['host-catalogs'] =
      [];
    await visit(urls.orgScope);

    await click(`[href="${urls.projectScope}"]`);

    assert.false(
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].includes('list'),
    );
    assert.false(
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].includes('create'),
    );
    assert
      .dom('[title="Resources"] a:nth-of-type(3)')
      .doesNotIncludeText('Host Catalogs');
  });

  test('user can navigate to index with only create action', async function (assert) {
    instances.scopes.project.authorized_collection_actions['host-catalogs'] =
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].filter((item) => item !== 'list');
    await visit(urls.orgScope);

    await click(`[href="${urls.projectScope}"]`);

    assert.false(
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].includes('list'),
    );
    assert.true(
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].includes('create'),
    );
    assert.dom(`[href="${urls.hostCatalogs}"]`).exists();

    await click(`[href="${urls.hostCatalogs}"]`);

    assert.dom('.rose-table-body  tr:first-child a').doesNotExist();
  });

  test('user can navigate to index with only list action', async function (assert) {
    instances.scopes.project.authorized_collection_actions['host-catalogs'] =
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].filter((item) => item !== 'create');
    await visit(urls.orgScope);

    await click(`[href="${urls.projectScope}"]`);

    assert.false(
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].includes('create'),
    );
    assert.true(
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].includes('list'),
    );
    assert.dom(`[href="${urls.hostCatalogs}"]`).exists();

    await click(`[href="${urls.hostCatalogs}"]`);

    assert.dom(`[href="${urls.staticHostCatalog}"]`).exists();
  });

  test('user can search for a specific host catalog by id', async function (assert) {
    await visit(urls.projectScope);

    await click(`[href="${urls.hostCatalogs}"]`);
    assert.dom(`[href="${urls.staticHostCatalog}"]`).exists();
    assert.dom(`[href="${urls.awsHostCatalog}"]`).exists();
    assert.dom(`[href="${urls.azureHostCatalog}"]`).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, instances.staticHostCatalog.id);
    await waitFor(`[href="${urls.awsHostCatalog}"]`, { count: 0 });

    assert.dom(`[href="${urls.staticHostCatalog}"]`).exists();
  });

  test('user can search for aws host catalog', async function (assert) {
    await visit(urls.projectScope);

    await click(`[href="${urls.hostCatalogs}"]`);
    assert.dom(`[href="${urls.staticHostCatalog}"]`).exists();
    assert.dom(`[href="${urls.awsHostCatalog}"]`).exists();
    assert.dom(`[href="${urls.azureHostCatalog}"]`).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, TYPE_HOST_CATALOG_PLUGIN_AWS);
    await waitFor(`[href="${urls.staticHostCatalog}"]`, { count: 0 });

    assert.dom(`[href="${urls.awsHostCatalog}"]`).exists();
  });

  test('user can search for azure host catalog', async function (assert) {
    await visit(urls.projectScope);

    await click(`[href="${urls.hostCatalogs}"]`);
    assert.dom(`[href="${urls.staticHostCatalog}"]`).exists();
    assert.dom(`[href="${urls.awsHostCatalog}"]`).exists();
    assert.dom(`[href="${urls.azureHostCatalog}"]`).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, TYPE_HOST_CATALOG_PLUGIN_AZURE);
    await waitFor(`[href="${urls.staticHostCatalog}"]`, { count: 0 });

    assert.dom(`[href="${urls.azureHostCatalog}"]`).exists();
  });

  test('user can search for host catalogs and get no results', async function (assert) {
    await visit(urls.projectScope);

    await click(`[href="${urls.hostCatalogs}"]`);
    assert.dom(`[href="${urls.staticHostCatalog}"]`).exists();
    assert.dom(`[href="${urls.awsHostCatalog}"]`).exists();
    assert.dom(`[href="${urls.azureHostCatalog}"]`).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, 'wow look at me I am a search query');
    await waitFor(NO_RESULTS_MSG_SELECTOR, { count: 1 });

    assert.dom(`[href="${urls.staticHostCatalog}"]`).doesNotExist();
    assert.dom(`[href="${urls.awsHostCatalog}"]`).doesNotExist();
    assert.dom(`[href="${urls.azureHostCatalog}"]`).doesNotExist();
    assert.dom(NO_RESULTS_MSG_SELECTOR).includesText('No results found');
  });
});
