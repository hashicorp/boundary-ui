/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { click, currentURL, fillIn, visit, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';
import {
  TYPE_HOST_CATALOG_DYNAMIC,
  TYPE_HOST_CATALOG_PLUGIN_AWS,
  TYPE_HOST_CATALOG_PLUGIN_AZURE,
  TYPE_HOST_CATALOG_PLUGIN_GCP,
  TYPE_HOST_CATALOG_STATIC,
} from 'api/models/host-catalog';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { faker } from '@faker-js/faker';

module('Acceptance | host-catalogs | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);

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

  test('Host catalogs table is sorted by `created_time` descending by default', async function (assert) {
    this.server.schema.hostCatalogs.all().destroy();
    const years = ['2006', '2005', '2004', '2003'];
    faker.helpers.shuffle(years).map((year) => {
      return this.server.create('host-catalog', {
        scope: instances.scopes.project,
        type: TYPE_HOST_CATALOG_STATIC,
        created_time: `${year}-01-01T00:00:00Z`,
        name: `Host catalogs ${year}`,
      });
    });

    await visit(urls.hostCatalogs);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: years.length });
    years.forEach((year, index) => {
      // nth-child index starts at 1
      assert
        .dom(commonSelectors.TABLE_ROW(index + 1))
        .containsText(`Host catalogs ${year}`);
    });
  });

  test.each(
    'sorting',
    {
      'on name': {
        attribute: {
          key: 'name',
          values: ['Alpha', 'Delta', 'Beta', 'Gamma', 'Epsilon'],
        },
        expectedAscendingSort: ['Alpha', 'Beta', 'Delta', 'Epsilon', 'Gamma'],
        column: 1,
      },
      'on id': {
        attribute: {
          key: 'id',
          values: ['hc_1000', 'hc_0001', 'hc_0100', 'hc_0010'],
        },
        expectedAscendingSort: ['hc_0001', 'hc_0010', 'hc_0100', 'hc_1000'],
        column: 3,
      },
    },
    async function (assert, input) {
      this.server.schema.hostCatalogs.all().destroy();
      faker.helpers.shuffle(input.attribute.values).forEach((value) => {
        this.server.create('host-catalog', {
          [input.attribute.key]: value,
          scope: instances.scopes.project,
        });
      });

      await visit(urls.hostCatalogs);

      // click the sort button again to sort in ascending order
      await click(commonSelectors.TABLE_SORT_BTN(input.column));
      assert.true(currentURL().includes('sortDirection=asc'));
      assert.true(
        currentURL().includes(`sortAttribute=${input.attribute.key}`),
      );
      assert
        .dom(commonSelectors.TABLE_SORT_BTN_ARROW_UP(input.column))
        .isVisible();

      assert
        .dom(commonSelectors.TABLE_ROWS)
        .isVisible({ count: input.attribute.values.length });

      input.expectedAscendingSort.forEach((expected, index) => {
        // nth-child index starts at 1
        assert.dom(commonSelectors.TABLE_ROW(index + 1)).containsText(expected);
      });

      // click the sort button again to sort in descending order
      await click(commonSelectors.TABLE_SORT_BTN(input.column));
      assert.true(currentURL().includes('sortDirection=desc'));
      assert.true(
        currentURL().includes(`sortAttribute=${input.attribute.key}`),
      );
      assert
        .dom(commonSelectors.TABLE_SORT_BTN_ARROW_DOWN(input.column))
        .isVisible();

      input.expectedAscendingSort.toReversed().forEach((expected, index) => {
        // nth-child index starts at 1
        assert.dom(commonSelectors.TABLE_ROW(index + 1)).containsText(expected);
      });
    },
  );
});
