/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, waitFor, fillIn, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { faker } from '@faker-js/faker';
import {
  TYPE_AUTH_METHOD_PASSWORD,
  TYPE_AUTH_METHOD_OIDC,
} from 'api/models/auth-method';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | auth-methods | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    passwordAuthMethod: null,
    oidcAuthMethod: null,
  };

  const urls = {
    globalScope: null,
    orgScope: null,
    authMethods: null,
    passwordAuthMethod: null,
    oidcAuthMethod: null,
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
    instances.passwordAuthMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
      type: TYPE_AUTH_METHOD_PASSWORD,
    });
    instances.oidcAuthMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
      type: TYPE_AUTH_METHOD_OIDC,
    });
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.authMethods = `/scopes/${instances.scopes.org.id}/auth-methods`;
    urls.passwordAuthMethod = `${urls.authMethods}/${instances.passwordAuthMethod.id}`;
    urls.oidcAuthMethod = `${urls.authMethods}/${instances.oidcAuthMethod.id}`;

    await authenticateSession({});
  });

  test('users can navigate to auth methods with proper authorization', async function (assert) {
    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.orgScope));

    assert.true(
      instances.scopes.org.authorized_collection_actions[
        'auth-methods'
      ].includes('list'),
    );
    assert.dom(commonSelectors.HREF(urls.authMethods)).isVisible();
  });

  test('users cannot navigate to index without either list or create actions', async function (assert) {
    instances.scopes.org.authorized_collection_actions['auth-methods'] = [];
    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.orgScope));

    assert.false(
      instances.scopes.org.authorized_collection_actions[
        'auth-methods'
      ].includes('list'),
    );
    assert.dom(commonSelectors.HREF(urls.authMethods)).isNotVisible();
  });

  test('users can navigate to index with only create action', async function (assert) {
    instances.scopes.org.authorized_collection_actions['auth-methods'] = [
      'create',
    ];
    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.orgScope));
    assert.dom(commonSelectors.HREF(urls.authMethods)).isVisible();
  });

  test('user can search for a specifc auth-method by id', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.authMethods));
    assert.dom(commonSelectors.HREF(urls.passwordAuthMethod)).isVisible();
    assert.dom(commonSelectors.HREF(urls.oidcAuthMethod)).isVisible();

    await fillIn(selectors.SEARCH_BAR_INPUT, instances.passwordAuthMethod.id);
    await waitFor(commonSelectors.HREF(urls.oidcAuthMethod), { count: 0 });

    assert.dom(commonSelectors.HREF(urls.passwordAuthMethod)).isVisible();
    assert.dom(commonSelectors.HREF(urls.oidcAuthMethod)).isNotVisible();
  });

  test('user can search for auth-methods and get no results', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.authMethods));
    assert.dom(commonSelectors.HREF(urls.passwordAuthMethod)).isVisible();
    assert.dom(commonSelectors.HREF(urls.oidcAuthMethod)).isVisible();

    await fillIn(selectors.SEARCH_BAR_INPUT, 'fake target that does not exist');
    await waitFor(commonSelectors.PAGE_MESSAGE_HEADER, { count: 1 });

    assert.dom(commonSelectors.HREF(urls.passwordAuthMethod)).isNotVisible();
    assert.dom(commonSelectors.HREF(urls.oidcAuthMethod)).isNotVisible();
    assert
      .dom(commonSelectors.PAGE_MESSAGE_HEADER)
      .includesText('No results found');
  });

  test('user can filter for auth-methods by type', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.authMethods));
    assert.dom(commonSelectors.HREF(urls.passwordAuthMethod)).isVisible();
    assert.dom(commonSelectors.HREF(urls.oidcAuthMethod)).isVisible();

    await click(commonSelectors.FILTER_DROPDOWN('type'));
    await click(
      commonSelectors.FILTER_DROPDOWN_ITEM(TYPE_AUTH_METHOD_PASSWORD),
    );
    await click(commonSelectors.FILTER_DROPDOWN_ITEM_APPLY_BTN('type'));

    assert.dom(commonSelectors.HREF(urls.oidcAuthMethod)).isNotVisible();
    assert.dom(commonSelectors.HREF(urls.passwordAuthMethod)).isVisible();
  });

  test('user can filter for auth-methods by primary', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.authMethods));
    assert.dom(commonSelectors.HREF(urls.passwordAuthMethod)).isVisible();
    assert.dom(commonSelectors.HREF(urls.oidcAuthMethod)).isVisible();

    await click(
      selectors.TABLE_ACTION_DROPDOWN(instances.passwordAuthMethod.id),
    );
    await click(
      selectors.TABLE_ACTION_DROPDOWN_MAKE_PRIMARY(
        instances.passwordAuthMethod.id,
      ),
    );

    await click(commonSelectors.FILTER_DROPDOWN('primary'));
    await click(commonSelectors.FILTER_DROPDOWN_ITEM('true'));
    await click(commonSelectors.FILTER_DROPDOWN_ITEM_APPLY_BTN('primary'));

    assert.dom(commonSelectors.HREF(urls.oidcAuthMethod)).isNotVisible();
    assert.dom(commonSelectors.HREF(urls.passwordAuthMethod)).isVisible();
  });

  test('auth-methods table is sorted by `created_time` descending by default', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.server.schema.authMethods.all().destroy();
    const years = ['2006', '2005', '2004', '2003'];
    faker.helpers.shuffle(years).map((year) => {
      return this.server.create('auth-method', {
        scope: instances.scopes.org,
        type: TYPE_AUTH_METHOD_PASSWORD,
        created_time: `${year}-01-01T00:00:00Z`,
        name: `Auth-method ${year}`,
      });
    });

    await visit(urls.authMethods);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: years.length });

    years.forEach((year, index) => {
      // nth-child index starts at 1
      assert
        .dom(commonSelectors.TABLE_ROW(index + 1))
        .containsText(`Auth-method ${year}`);
    });
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
      'on type': {
        attribute: {
          key: 'type',
          values: ['Password', 'Oidc', 'Oidc', 'Password', 'Ldap'],
        },
        expectedAscendingSort: ['Ldap', 'Oidc', 'Oidc', 'Password', 'Password'],
        column: 2,
      },
      'on id': {
        attribute: {
          key: 'id',
          values: ['am_1000', 'am_0001', 'am_0100', 'am_0010'],
        },
        expectedAscendingSort: ['am_0001', 'am_0010', 'am_0100', 'am_1000'],
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

      this.server.schema.authMethods.all().destroy();
      faker.helpers.shuffle(input.attribute.values).forEach((value) => {
        this.server.create('auth-method', {
          [input.attribute.key]: value,
          scope: instances.scopes.org,
        });
      });

      await visit(urls.authMethods);

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
