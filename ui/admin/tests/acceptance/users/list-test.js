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
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { faker } from '@faker-js/faker';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | users | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    user1: null,
    user2: null,
  };

  const urls = {
    globalScope: null,
    orgScope: null,
    users: null,
    user1: null,
    user2: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.user1 = this.server.create('user', {
      scope: instances.scopes.org,
    });
    instances.user2 = this.server.create('user', {
      scope: instances.scopes.org,
    });
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.users = `${urls.orgScope}/users`;
    urls.user1 = `${urls.users}/${instances.user1.id}`;
    urls.user2 = `${urls.users}/${instances.user2.id}`;
    await authenticateSession({});
  });

  test('users can navigate to users with proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.orgScope));

    assert.true(
      instances.scopes.org.authorized_collection_actions.users.includes('list'),
    );
    assert.true(
      instances.scopes.org.authorized_collection_actions.users.includes(
        'create',
      ),
    );
    assert.dom(commonSelectors.HREF(urls.users)).exists();
  });

  test('user cannot navigate to users tab without either list or create actions', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.scopes.org.authorized_collection_actions.users = [];
    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.orgScope));

    assert.false(
      instances.scopes.org.authorized_collection_actions.users.includes(
        'create',
      ),
    );
    assert.false(
      instances.scopes.org.authorized_collection_actions.users.includes('list'),
    );
    assert.dom(`nav ${commonSelectors.HREF(urls.users)}`).doesNotExist();
  });

  test('user can navigate to users tab with only create action', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.scopes.org.authorized_collection_actions.users =
      instances.scopes.org.authorized_collection_actions.users.filter(
        (item) => item !== 'list',
      );
    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.orgScope));

    assert.false(
      instances.scopes.org.authorized_collection_actions.users.includes('list'),
    );
    assert.true(
      instances.scopes.org.authorized_collection_actions.users.includes(
        'create',
      ),
    );
    assert.dom(commonSelectors.HREF(urls.users)).exists();

    await click(commonSelectors.HREF(urls.users));

    assert.dom(commonSelectors.PAGE_MESSAGE_DESCRIPTION).isVisible();
    assert.dom(commonSelectors.TABLE_RESOURCE_LINK(urls.user1)).doesNotExist();
  });

  test('user can navigate to users tab with only list action', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.scopes.org.authorized_collection_actions.users =
      instances.scopes.org.authorized_collection_actions.users.filter(
        (item) => item !== 'create',
      );
    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.orgScope));

    assert.true(
      instances.scopes.org.authorized_collection_actions.users.includes('list'),
    );
    assert.false(
      instances.scopes.org.authorized_collection_actions.users.includes(
        'create',
      ),
    );
    assert.dom(commonSelectors.HREF(urls.users)).exists();

    await click(commonSelectors.HREF(urls.users));

    assert.dom(commonSelectors.HREF(urls.user1)).exists();
  });

  test('user can search for a user by id', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.users));

    assert.dom(commonSelectors.HREF(urls.user1)).exists();
    assert.dom(commonSelectors.HREF(urls.user2)).exists();

    await fillIn(commonSelectors.SEARCH_INPUT, instances.user1.id);
    await waitUntil(
      () => findAll(commonSelectors.HREF(urls.user2)).length === 0,
    );

    assert.dom(commonSelectors.HREF(urls.user1)).exists();
    assert.dom(commonSelectors.HREF(urls.user2)).doesNotExist();
  });

  test('user can search for users and get no results', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.users));

    assert.dom(commonSelectors.HREF(urls.user1)).exists();
    assert.dom(commonSelectors.HREF(urls.user2)).exists();

    await fillIn(commonSelectors.SEARCH_INPUT, 'fake user that does not exist');
    await waitUntil(() => findAll(selectors.NO_RESULTS_MSG).length === 1);

    assert.dom(commonSelectors.HREF(urls.user1)).doesNotExist();
    assert.dom(commonSelectors.HREF(urls.user2)).doesNotExist();
    assert.dom(selectors.NO_RESULTS_MSG).includesText('No results found');
  });

  test('users are sorted by created_time descending by default', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.server.schema.users.all().destroy();

    const years = ['2026', '2025', '2024', '2023'];
    faker.helpers.shuffle(years).map((year) => {
      return this.server.create('user', {
        id: `u_${year}`,
        name: `User ${year}`,
        created_time: `${year}-01-01T00:00:00Z`,
        scope: instances.scopes.org,
      });
    });

    await visit(urls.users);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: years.length });
    assert.dom(commonSelectors.TABLE_ROW(1)).containsText('User 2026');
    assert.dom(commonSelectors.TABLE_ROW(2)).containsText('User 2025');
    assert.dom(commonSelectors.TABLE_ROW(3)).containsText('User 2024');
    assert.dom(commonSelectors.TABLE_ROW(4)).containsText('User 2023');
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
          values: ['u_0001', 'u_0010', 'u_0100', 'u_1000', 'u_10000'],
        },
        expectedAscendingSort: [
          'u_0001',
          'u_0010',
          'u_0100',
          'u_1000',
          'u_10000',
        ],
        column: 2,
      },
    },
    async function (assert, input) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-04
            enabled: false,
          },
        },
      });

      this.server.schema.users.all().destroy();

      faker.helpers.shuffle(input.attribute.values).forEach((value) => {
        this.server.create('user', {
          [input.attribute.key]: value,
          scope: instances.scopes.org,
        });
      });

      await visit(urls.users);

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
