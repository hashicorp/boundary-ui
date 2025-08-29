/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import {
  visit,
  click,
  fillIn,
  waitUntil,
  findAll,
  currentURL,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { faker } from '@faker-js/faker';

module('Acceptance | groups | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);

  const SEARCH_INPUT_SELECTOR = '.search-filtering [type="search"]';
  const NO_RESULTS_MSG_SELECTOR = '[data-test-no-groups-results]';

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    group1: null,
    group2: null,
  };

  const urls = {
    orgScope: null,
    groups: null,
    group1: null,
    group2: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create(
      'scope',
      {
        type: 'org',
        scope: { id: 'global', type: 'global' },
      },
      'withChildren',
    );
    instances.group1 = this.server.create('group', {
      scope: instances.scopes.org,
    });
    instances.group2 = this.server.create('group', {
      scope: instances.scopes.org,
    });

    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.groups = `/scopes/${instances.scopes.org.id}/groups`;
    urls.group1 = `${urls.groups}/${instances.group1.id}`;
    urls.group2 = `${urls.groups}/${instances.group2.id}`;
    await authenticateSession({});
  });

  test('can navigate to groups with proper authorization', async function (assert) {
    await visit(urls.orgScope);
    assert.ok(
      instances.scopes.org.authorized_collection_actions.groups.includes(
        'list',
      ),
    );

    assert.dom(commonSelectors.HREF(urls.groups)).isVisible();
  });

  test('User cannot navigate to index without either list or create actions', async function (assert) {
    instances.scopes.org.authorized_collection_actions.groups = [];
    await visit(urls.orgScope);

    assert.notOk(
      instances.scopes.org.authorized_collection_actions.groups.includes(
        'list',
      ),
    );

    assert.dom(commonSelectors.HREF(urls.groups)).doesNotExist();
  });

  test('User can navigate to index with only create action', async function (assert) {
    instances.scopes.org.authorized_collection_actions.groups = ['create'];
    await visit(urls.orgScope);

    assert.dom(commonSelectors.HREF(urls.groups)).isVisible();
  });

  test('user can search for a specific group by id', async function (assert) {
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.groups));

    assert.dom(commonSelectors.HREF(urls.group1)).exists();
    assert.dom(commonSelectors.HREF(urls.group2)).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, instances.group1.id);
    await waitUntil(
      () => findAll(commonSelectors.HREF(urls.group2)).length === 0,
    );

    assert.dom(commonSelectors.HREF(urls.group1)).exists();
    assert.dom(commonSelectors.HREF(urls.group2)).doesNotExist();
  });

  test('user can search for groups and get no results', async function (assert) {
    await visit(urls.orgScope);

    await click(`[href="${urls.groups}"]`);

    assert.dom(`[href="${urls.group1}"]`).exists();
    assert.dom(`[href="${urls.group2}"]`).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, 'fake group that does not exist');
    await waitUntil(() => findAll(NO_RESULTS_MSG_SELECTOR).length === 1);

    assert.dom(commonSelectors.HREF(urls.group1)).doesNotExist();
    assert.dom(commonSelectors.HREF(urls.group2)).doesNotExist();
    assert.dom(NO_RESULTS_MSG_SELECTOR).includesText('No results found');
  });

  test('groups table is sorted by created_time descending by default', async function (assert) {
    this.server.schema.groups.all().destroy();

    const years = ['2026', '2025', '2024', '2023'];
    faker.helpers.shuffle(years).map((year) => {
      return this.server.create('group', {
        scope: instances.scopes.org,
        id: `g_${year}`,
        name: `Group ${year}`,
        created_time: `${year}-01-01T00:00:00Z`,
      });
    });

    await visit(urls.groups);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: years.length });
    assert.dom(commonSelectors.TABLE_ROW(1)).containsText('Group 2026');
    assert.dom(commonSelectors.TABLE_ROW(2)).containsText('Group 2025');
    assert.dom(commonSelectors.TABLE_ROW(3)).containsText('Group 2024');
    assert.dom(commonSelectors.TABLE_ROW(4)).containsText('Group 2023');
  });

  test.each(
    'sorting',
    {
      'on name': {
        attribute: {
          key: 'name',
          values: ['Alpha', 'Beta', 'Delta', 'Gamma', 'Epsilon'],
        },
        expectedAscendingSort: ['Alpha', 'Beta', 'Delta', 'Epsilon', 'Gamma'],
        column: 1,
      },
      'on id': {
        attribute: {
          key: 'id',
          values: ['g_0001', 'g_0010', 'g_0100', 'g_1000', 'g_10000'],
        },
        expectedAscendingSort: [
          'g_0001',
          'g_0010',
          'g_0100',
          'g_1000',
          'g_10000',
        ],
        column: 2,
      },
    },
    async function (assert, input) {
      this.server.schema.groups.all().destroy();
      faker.helpers.shuffle(input.attribute.values).forEach((value) => {
        this.server.create('group', {
          [input.attribute.key]: value,
          scope: instances.scopes.org,
        });
      });

      await visit(urls.groups);

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
