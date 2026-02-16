/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { currentURL, visit, fillIn, waitFor, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { faker } from '@faker-js/faker';

module('Acceptance | scopes | list', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  const instances = {
    scopes: {
      org1: null,
      org2: null,
      project1: null,
      project2: null,
    },
  };

  const urls = {
    scopes: null,
    globalScope: null,
    orgScope: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.org1 = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.org2 = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project1 = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org1.id, type: 'org' },
    });
    instances.scopes.project2 = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org1.id, type: 'org' },
    });

    urls.scopes = '/scopes';
    urls.globalScope = '/scopes/global/scopes';
    urls.orgScope = `/scopes/${instances.scopes.org1.id}/scopes`;
  });

  test('user gets redirected to scopes list view', async function (assert) {
    await visit(urls.scopes);

    assert.strictEqual(currentURL(), urls.globalScope);
  });

  test('user can search for a specific org scope by id', async function (assert) {
    await visit(urls.globalScope);

    assert
      .dom(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.org1.id))
      .exists();
    assert
      .dom(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.org2.id))
      .exists();

    await fillIn(commonSelectors.SEARCH_INPUT, instances.scopes.org1.id);
    await waitFor(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.org2.id), {
      count: 0,
    });

    assert
      .dom(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.org1.id))
      .exists();
    assert
      .dom(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.org2.id))
      .doesNotExist();
  });

  test('user can search for org scopes and get no results', async function (assert) {
    await visit(urls.globalScope);

    assert
      .dom(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.org1.id))
      .exists();
    assert
      .dom(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.org2.id))
      .exists();

    await fillIn(
      commonSelectors.SEARCH_INPUT,
      'fake org scope that does not exist',
    );
    await waitFor(selectors.NO_SCOPE_RESULTS_MSG, { count: 1 });

    assert
      .dom(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.org1.id))
      .doesNotExist();
    assert
      .dom(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.org2.id))
      .doesNotExist();
  });

  test('user can search for a specific project scope by id', async function (assert) {
    await visit(urls.orgScope);

    assert
      .dom(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.project1.id))
      .exists();
    assert
      .dom(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.project2.id))
      .exists();

    await fillIn(commonSelectors.SEARCH_INPUT, instances.scopes.project1.id);
    await waitFor(
      selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.project2.id),
      {
        count: 0,
      },
    );

    assert
      .dom(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.project1.id))
      .exists();
    assert
      .dom(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.project2.id))
      .doesNotExist();
  });

  test('user can search for project scopes and get no results', async function (assert) {
    await visit(urls.orgScope);

    assert
      .dom(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.project1.id))
      .exists();
    assert
      .dom(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.project2.id))
      .exists();

    await fillIn(
      commonSelectors.SEARCH_INPUT,
      'fake org scope that does not exist',
    );
    await waitFor(selectors.NO_SCOPE_RESULTS_MSG, { count: 1 });

    assert
      .dom(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.project1.id))
      .doesNotExist();
    assert
      .dom(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.project2.id))
      .doesNotExist();
  });

  test('scopes are sorted by created_time descending by default', async function (assert) {
    this.server.schema.scopes.all().destroy();

    const years = ['2026', '2025', '2024', '2023'];
    faker.helpers.shuffle(years).map((year) => {
      return this.server.create('scope', {
        id: `o_${year}`,
        type: 'org',
        name: `Org ${year}`,
        scope: { id: 'global', type: 'global' },
        created_time: `${year}-01-01T00:00:00Z`,
      });
    });

    await visit(urls.globalScope);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: years.length });
    assert.dom(commonSelectors.TABLE_ROW(1)).containsText('Org 2026');
    assert.dom(commonSelectors.TABLE_ROW(2)).containsText('Org 2025');
    assert.dom(commonSelectors.TABLE_ROW(3)).containsText('Org 2024');
    assert.dom(commonSelectors.TABLE_ROW(4)).containsText('Org 2023');
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
          values: ['o_0001', 'o_0010', 'o_0100', 'o_1000', 'o_10000'],
        },
        expectedAscendingSort: [
          'o_0001',
          'o_0010',
          'o_0100',
          'o_1000',
          'o_10000',
        ],
        column: 2,
      },
    },
    async function (assert, input) {
      this.server.schema.scopes.all().destroy();

      faker.helpers.shuffle(input.attribute.values).forEach((value) => {
        this.server.create('scope', {
          [input.attribute.key]: value,
          type: 'org',
          scope: { id: 'global', type: 'global' },
        });
      });

      await visit(urls.globalScope);

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
