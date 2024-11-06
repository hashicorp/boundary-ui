/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, fillIn, waitUntil, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | groups | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

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

  hooks.beforeEach(function () {
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
    authenticateSession({});
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
    await waitUntil(() => findAll(`[href="${urls.group2}"]`).length === 0);

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
});
