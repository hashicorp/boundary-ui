/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { click, currentURL, fillIn, visit, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { faker } from '@faker-js/faker';
import {
  TYPE_CREDENTIAL_STORE_STATIC,
  TYPE_CREDENTIAL_STORE_VAULT,
} from 'api/models/credential-store';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | credential-stores | list', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  const instances = {
    scopes: {
      org: null,
      project: null,
    },
    staticCredentialStore: null,
    vaultCredentialStore: null,
  };

  const urls = {
    orgScope: null,
    projectScope: null,
    credentialStores: null,
    staticCredentialStore: null,
    vaultCredentialStore: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.staticCredentialStore = this.server.create('credential-store', {
      scope: instances.scopes.project,
      type: TYPE_CREDENTIAL_STORE_STATIC,
    });
    instances.vaultCredentialStore = this.server.create('credential-store', {
      scope: instances.scopes.project,
      type: TYPE_CREDENTIAL_STORE_VAULT,
    });
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.credentialStores = `${urls.projectScope}/credential-stores`;
    urls.staticCredentialStore = `${urls.credentialStores}/${instances.staticCredentialStore.id}`;
    urls.vaultCredentialStore = `${urls.credentialStores}/${instances.vaultCredentialStore.id}`;

    const featuresService = this.owner.lookup('service:features');
    featuresService.enable('static-credentials');
  });

  test('users can navigate to credential-stores with proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.projectScope));

    assert.true(
      instances.scopes.project.authorized_collection_actions[
        'credential-stores'
      ].includes('list'),
    );
    assert.dom(commonSelectors.HREF(urls.credentialStores)).isVisible();
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

    instances.scopes.project.authorized_collection_actions[
      'credential-stores'
    ] = [];
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.projectScope));

    assert.false(
      instances.scopes.project.authorized_collection_actions[
        'credential-stores'
      ].includes('list'),
    );
    assert.false(
      instances.scopes.project.authorized_collection_actions[
        'credential-stores'
      ].includes('create'),
    );
    assert.dom(commonSelectors.HREF(urls.credentialStores)).doesNotExist();
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

    instances.scopes.project.authorized_collection_actions[
      'credential-stores'
    ] = ['create'];
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.projectScope));

    assert.dom(commonSelectors.HREF(urls.credentialStores)).isVisible();
  });

  test('users can link to docs page for credential stores', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.credentialStores));

    assert
      .dom(
        `[href="https://developer.hashicorp.com/boundary/docs/concepts/domain-model/credential-stores"]`,
      )
      .isVisible();
  });

  test('user can search for a specific credential-store by id', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.credentialStores));

    assert.dom(commonSelectors.HREF(urls.staticCredentialStore)).isVisible();
    assert.dom(commonSelectors.HREF(urls.vaultCredentialStore)).isVisible();

    await fillIn(
      commonSelectors.SEARCH_INPUT,
      instances.staticCredentialStore.id,
    );
    await waitFor(commonSelectors.HREF(urls.vaultCredentialStore), {
      count: 0,
    });

    assert.dom(commonSelectors.HREF(urls.staticCredentialStore)).isVisible();
    assert.dom(commonSelectors.HREF(urls.vaultCredentialStore)).doesNotExist();
  });

  test('user can search for credential-stores and get no results', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.credentialStores));

    assert.dom(commonSelectors.HREF(urls.staticCredentialStore)).isVisible();
    assert.dom(commonSelectors.HREF(urls.vaultCredentialStore)).isVisible();

    await fillIn(
      commonSelectors.SEARCH_INPUT,
      'fake cred store that does not exist',
    );
    await waitFor(selectors.NO_RESULTS_MSG, { count: 1 });

    assert.dom(commonSelectors.HREF(urls.staticCredentialStore)).doesNotExist();
    assert.dom(commonSelectors.HREF(urls.vaultCredentialStore)).doesNotExist();
    assert.dom(selectors.NO_RESULTS_MSG).includesText('No results found');
  });

  test('user can filter for credential-stores by type', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.credentialStores));

    assert.dom(commonSelectors.HREF(urls.staticCredentialStore)).isVisible();
    assert.dom(commonSelectors.HREF(urls.vaultCredentialStore)).isVisible();

    await click(commonSelectors.FILTER_DROPDOWN('type'));

    await click(
      commonSelectors.FILTER_DROPDOWN_ITEM(TYPE_CREDENTIAL_STORE_VAULT),
    );
    await click(commonSelectors.FILTER_DROPDOWN_ITEM_APPLY_BTN('type'));

    assert.dom(commonSelectors.HREF(urls.staticCredentialStore)).doesNotExist();
    assert.dom(commonSelectors.HREF(urls.vaultCredentialStore)).isVisible();
  });

  test('credential stores table is sorted by `created_time` descending by default', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.server.schema.credentialStores.all().destroy();
    const years = ['2006', '2005', '2004', '2003'];
    faker.helpers.shuffle(years).map((year) => {
      return this.server.create('credential-store', {
        scope: instances.scopes.project,
        type: TYPE_CREDENTIAL_STORE_STATIC,
        created_time: `${year}-01-01T00:00:00Z`,
        name: `Credential-store ${year}`,
      });
    });

    await visit(urls.credentialStores);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: years.length });
    years.forEach((year, index) => {
      // nth-child index starts at 1
      assert
        .dom(commonSelectors.TABLE_ROW(index + 1))
        .containsText(`Credential-store ${year}`);
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
          values: ['Vault', 'Vault', 'Static', 'Vault', 'Static'],
        },
        expectedAscendingSort: ['Static', 'Static', 'Vault', 'Vault', 'Vault'],
        column: 2,
      },
      'on id': {
        attribute: {
          key: 'id',
          values: ['cs_1000', 'cs_0001', 'cs_0100', 'cs_0010'],
        },
        expectedAscendingSort: ['cs_0001', 'cs_0010', 'cs_0100', 'cs_1000'],
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

      this.server.schema.credentialStores.all().destroy();
      faker.helpers.shuffle(input.attribute.values).forEach((value) => {
        this.server.create('credential-store', {
          [input.attribute.key]: value,
          scope: instances.scopes.project,
        });
      });

      await visit(urls.credentialStores);

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
