/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import {
  visit,
  findAll,
  click,
  fillIn,
  waitUntil,
  focus,
  currentURL,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { GRANT_SCOPE_THIS } from 'api/models/role';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { faker } from '@faker-js/faker';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | roles | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    role1: null,
    role2: null,
  };

  const urls = {
    globalScope: null,
    orgScope: null,
    roles: null,
    role1: null,
    role2: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.role1 = this.server.create('role', {
      scope: instances.scopes.org,
    });
    instances.role2 = this.server.create('role', {
      scope: instances.scopes.org,
    });
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.roles = `/scopes/${instances.scopes.org.id}/roles`;
    urls.role1 = `${urls.roles}/${instances.role1.id}`;
    urls.role2 = `${urls.roles}/${instances.role2.id}`;
    await authenticateSession({});
  });

  test('users can navigate to roles with proper authorization', async function (assert) {
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
      instances.scopes.org.authorized_collection_actions.roles.includes('list'),
    );
    assert.dom(commonSelectors.HREF(urls.roles)).isVisible();
  });

  test('users cannot navigate to index without either list or create actions', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.scopes.org.authorized_collection_actions.roles = [];
    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.orgScope));

    assert.false(
      instances.scopes.org.authorized_collection_actions.roles.includes('list'),
    );
    assert.dom(commonSelectors.HREF(urls.roles)).doesNotExist();
  });

  test('users can navigate to index with only create action', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.scopes.org.authorized_collection_actions.roles = ['create'];
    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.orgScope));

    assert.dom(commonSelectors.HREF(urls.roles)).isVisible();
  });

  test('user can search for a specific role by id', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.roles));

    assert.dom(commonSelectors.HREF(urls.role1)).isVisible();
    assert.dom(commonSelectors.HREF(urls.role2)).isVisible();

    await fillIn(commonSelectors.SEARCH_INPUT, instances.role1.id);
    await waitUntil(
      () => findAll(commonSelectors.HREF(urls.role2)).length === 0,
    );

    assert.dom(commonSelectors.HREF(urls.role1)).isVisible();
    assert.dom(commonSelectors.HREF(urls.role2)).doesNotExist();
  });

  test('user can search for roles and get no results', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.roles));

    assert.dom(commonSelectors.HREF(urls.role1)).isVisible();
    assert.dom(commonSelectors.HREF(urls.role2)).isVisible();

    await fillIn(commonSelectors.SEARCH_INPUT, 'fake role that does not exist');
    await waitUntil(() => findAll(selectors.NO_RESULTS_MSG).length === 1);

    assert.dom(commonSelectors.HREF(urls.role1)).doesNotExist();
    assert.dom(commonSelectors.HREF(urls.role2)).doesNotExist();
    assert.dom(selectors.NO_RESULTS_MSG).includesText('No results found');
  });

  test('correct badge in grants applied column is visible to user', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.role1.grant_scope_ids = instances.role1.grant_scope_ids.filter(
      (id) => id !== GRANT_SCOPE_THIS,
    );
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.roles));

    assert.true(instances.role2.grant_scope_ids.includes(GRANT_SCOPE_THIS));
    assert.dom(selectors.ROLE_BADGE(instances.role1.id)).hasText('No');
    assert.dom(selectors.ROLE_BADGE(instances.role2.id)).hasText('Yes');

    await focus(selectors.ROLE_TOOLTIP_BTN(instances.role1.id));

    assert
      .dom(selectors.ROLE_TOOLTIP_CONTENT(instances.role1.id))
      .hasText('The grants on this role have not been applied to this scope.');

    await focus(selectors.ROLE_TOOLTIP_BTN(instances.role2.id));

    assert
      .dom(selectors.ROLE_TOOLTIP_CONTENT(instances.role2.id))
      .hasText('The grants on this role have been applied to this scope.');
  });

  test('roles table is sorted by created_time descending by default', async function (assert) {
    this.server.schema.roles.all().destroy();

    const years = ['2026', '2025', '2024', '2023'];
    faker.helpers.shuffle(years).map((year) => {
      return this.server.create('role', {
        scope: instances.scopes.org,
        id: `r_${year}`,
        name: `Role ${year}`,
        created_time: `${year}-01-01T00:00:00Z`,
      });
    });

    await visit(urls.roles);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: years.length });
    assert.dom(commonSelectors.TABLE_ROW(1)).containsText('Role 2026');
    assert.dom(commonSelectors.TABLE_ROW(2)).containsText('Role 2025');
    assert.dom(commonSelectors.TABLE_ROW(3)).containsText('Role 2024');
    assert.dom(commonSelectors.TABLE_ROW(4)).containsText('Role 2023');
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
          values: ['r_0001', 'r_0010', 'r_0100', 'r_1000', 'r_10000'],
        },
        expectedAscendingSort: [
          'r_0001',
          'r_0010',
          'r_0100',
          'r_1000',
          'r_10000',
        ],
        column: 3,
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

      this.server.schema.roles.all().destroy();
      faker.helpers.shuffle(input.attribute.values).forEach((value) => {
        this.server.create('role', {
          [input.attribute.key]: value,
          scope: instances.scopes.org,
        });
      });

      await visit(urls.roles);

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
