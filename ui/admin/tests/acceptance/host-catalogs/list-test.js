/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, fillIn, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import {
  TYPE_HOST_CATALOG_DYNAMIC,
  TYPE_HOST_CATALOG_STATIC,
  TYPE_HOST_CATALOG_PLUGIN_AWS,
  TYPE_HOST_CATALOG_PLUGIN_AZURE,
  TYPE_HOST_CATALOG_PLUGIN_GCP,
} from 'api/models/host-catalog';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';

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
    gcpHostCatalog: null,
  };

  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    hostCatalogs: null,
    awsHostCatalog: null,
    azureHostCatalog: null,
    staticHostCatalog: null,
    gcpHostCatalog: null,
  };

  hooks.beforeEach(async function () {
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
    instances.gcpHostCatalog = this.server.create('host-catalog', {
      scope: instances.scopes.project,
      type: TYPE_HOST_CATALOG_DYNAMIC,
      plugin: { name: TYPE_HOST_CATALOG_PLUGIN_GCP },
    });

    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.hostCatalogs = `${urls.projectScope}/host-catalogs`;
    urls.staticHostCatalog = `${urls.hostCatalogs}/${instances.staticHostCatalog.id}`;
    urls.awsHostCatalog = `${urls.hostCatalogs}/${instances.awsHostCatalog.id}`;
    urls.azureHostCatalog = `${urls.hostCatalogs}/${instances.azureHostCatalog.id}`;
    urls.gcpHostCatalog = `${urls.hostCatalogs}/${instances.gcpHostCatalog.id}`;

    await authenticateSession({});
  });

  test('user can navigate to host catalogs with proper authorization', async function (assert) {
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.projectScope));

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
    assert.dom(commonSelectors.HREF(urls.hostCatalogs)).isVisible();
  });

  test('user cannot navigate to index without either list or create actions', async function (assert) {
    instances.scopes.project.authorized_collection_actions['host-catalogs'] =
      [];
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.projectScope));

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
    assert.dom(commonSelectors.HREF(urls.hostCatalogs)).doesNotExist();
  });

  test('user can navigate to index with only create action', async function (assert) {
    instances.scopes.project.authorized_collection_actions['host-catalogs'] =
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].filter((item) => item !== 'list');
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.projectScope));

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
    assert.dom(commonSelectors.HREF(urls.hostCatalogs)).isVisible();

    await click(commonSelectors.HREF(urls.hostCatalogs));

    assert.dom(commonSelectors.PAGE_MESSAGE_DESCRIPTION).isVisible();
    assert
      .dom(commonSelectors.TABLE_RESOURCE_LINK(urls.staticHostCatalog))
      .doesNotExist();
  });

  test('user can navigate to index with only list action', async function (assert) {
    instances.scopes.project.authorized_collection_actions['host-catalogs'] =
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].filter((item) => item !== 'create');
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.projectScope));

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
    assert.dom(commonSelectors.HREF(urls.hostCatalogs)).isVisible();

    await click(commonSelectors.HREF(urls.hostCatalogs));

    assert.dom(commonSelectors.HREF(urls.staticHostCatalog)).isVisible();
  });

  test('user can search for a specific host catalog by id', async function (assert) {
    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.hostCatalogs));

    assert.dom(commonSelectors.HREF(urls.staticHostCatalog)).isVisible();
    assert.dom(commonSelectors.HREF(urls.awsHostCatalog)).isVisible();
    assert.dom(commonSelectors.HREF(urls.azureHostCatalog)).isVisible();

    await fillIn(commonSelectors.SEARCH_INPUT, instances.staticHostCatalog.id);
    await waitFor(commonSelectors.HREF(urls.awsHostCatalog), {
      count: 0,
    });

    assert.dom(commonSelectors.HREF(urls.staticHostCatalog)).isVisible();
  });

  test('user can search for aws host catalog', async function (assert) {
    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.hostCatalogs));

    assert.dom(commonSelectors.HREF(urls.staticHostCatalog)).isVisible();
    assert.dom(commonSelectors.HREF(urls.awsHostCatalog)).isVisible();
    assert.dom(commonSelectors.HREF(urls.azureHostCatalog)).isVisible();

    await fillIn(commonSelectors.SEARCH_INPUT, TYPE_HOST_CATALOG_PLUGIN_AWS);
    await waitFor(commonSelectors.HREF(urls.staticHostCatalog), { count: 0 });

    assert.dom(commonSelectors.HREF(urls.awsHostCatalog)).isVisible();
  });

  test('user can search for azure host catalog', async function (assert) {
    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.hostCatalogs));

    assert.dom(commonSelectors.HREF(urls.staticHostCatalog)).isVisible();
    assert.dom(commonSelectors.HREF(urls.awsHostCatalog)).isVisible();
    assert.dom(commonSelectors.HREF(urls.azureHostCatalog)).isVisible();

    await fillIn(commonSelectors.SEARCH_INPUT, TYPE_HOST_CATALOG_PLUGIN_AZURE);
    await waitFor(commonSelectors.HREF(urls.staticHostCatalog), { count: 0 });

    assert.dom(commonSelectors.HREF(urls.azureHostCatalog)).isVisible();
  });

  test('user can search for gcp host catalog', async function (assert) {
    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.hostCatalogs));

    assert.dom(commonSelectors.HREF(urls.staticHostCatalog)).isVisible();
    assert.dom(commonSelectors.HREF(urls.awsHostCatalog)).isVisible();
    assert.dom(commonSelectors.HREF(urls.azureHostCatalog)).isVisible();
    assert.dom(commonSelectors.HREF(urls.gcpHostCatalog)).isVisible();

    await fillIn(commonSelectors.SEARCH_INPUT, TYPE_HOST_CATALOG_PLUGIN_GCP);
    await waitFor(commonSelectors.HREF(urls.staticHostCatalog), { count: 0 });

    assert.dom(commonSelectors.HREF(urls.gcpHostCatalog)).isVisible();
  });

  test('user can search for host catalogs and get no results', async function (assert) {
    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.hostCatalogs));

    assert.dom(commonSelectors.HREF(urls.staticHostCatalog)).isVisible();
    assert.dom(commonSelectors.HREF(urls.awsHostCatalog)).isVisible();
    assert.dom(commonSelectors.HREF(urls.azureHostCatalog)).isVisible();

    await fillIn(
      commonSelectors.SEARCH_INPUT,
      'wow look at me I am a search query',
    );
    await waitFor(selectors.NO_RESULTS_MSG, { count: 1 });

    assert.dom(commonSelectors.HREF(urls.staticHostCatalog)).doesNotExist();
    assert.dom(commonSelectors.HREF(urls.awsHostCatalog)).doesNotExist();
    assert.dom(commonSelectors.HREF(urls.azureHostCatalog)).doesNotExist();
    assert.dom(selectors.NO_RESULTS_MSG).includesText('No results found');
  });
});
