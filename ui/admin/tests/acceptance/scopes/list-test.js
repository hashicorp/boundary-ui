/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, fillIn, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';

module('Acceptance | scopes | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  const instances = {
    scopes: {
      global: null,
      org1: null,
      org2: null,
      project1: null,
      project2: null,
    },
  };

  const urls = {
    globalScope: null,
    orgScope: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
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
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org1.id}/scopes`;
    await authenticateSession({});
  });

  test('user can search for a specifc org scope by id', async function (assert) {
    await visit(urls.globalScope);

    assert
      .dom(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.org1.id))
      .isVisible();
    assert
      .dom(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.org2.id))
      .isVisible();

    await fillIn(commonSelectors.SEARCH_INPUT, instances.scopes.org1.id);
    await waitFor(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.org2.id), {
      count: 0,
    });

    assert
      .dom(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.org1.id))
      .isVisible();
    assert
      .dom(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.org2.id))
      .doesNotExist();
  });

  test('user can search for org scopes and get no results', async function (assert) {
    await visit(urls.globalScope);

    assert
      .dom(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.org1.id))
      .isVisible();
    assert
      .dom(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.org2.id))
      .isVisible();

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

  test('user can search for a specifc project scope by id', async function (assert) {
    await visit(urls.orgScope);

    assert
      .dom(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.project1.id))
      .isVisible();
    assert
      .dom(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.project2.id))
      .isVisible();

    await fillIn(commonSelectors.SEARCH_INPUT, instances.scopes.project1.id);
    await waitFor(
      selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.project2.id),
      {
        count: 0,
      },
    );

    assert
      .dom(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.project1.id))
      .isVisible();
    assert
      .dom(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.project2.id))
      .doesNotExist();
  });

  test('user can search for project scopes and get no results', async function (assert) {
    await visit(urls.orgScope);

    assert
      .dom(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.project1.id))
      .isVisible();
    assert
      .dom(selectors.TABLE_ROW_SCOPE_LINK(instances.scopes.project2.id))
      .isVisible();

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
});
