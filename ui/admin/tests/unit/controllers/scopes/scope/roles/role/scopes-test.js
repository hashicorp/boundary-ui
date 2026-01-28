/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit, waitUntil } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { setupIntl } from 'ember-intl/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import {
  GRANT_SCOPE_THIS,
  GRANT_SCOPE_CHILDREN,
  GRANT_SCOPE_DESCENDANTS,
} from 'api/models/role';
import { TYPE_SCOPE_ORG, TYPE_SCOPE_PROJECT } from 'api/models/scope';

module('Unit | Controller | scopes/scope/roles/role/scopes', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);
  setupIntl(hooks, 'en-us');

  let controller;

  const instances = {
    scopes: {
      global: null,
    },
    role: null,
  };

  const urls = {
    scopes: null,
  };

  hooks.beforeEach(async function () {
    controller = this.owner.lookup('controller:scopes/scope/roles/role/scopes');

    instances.scopes.global = this.server.create(
      'scope',
      { id: 'global' },
      'withGlobalAuth',
    );
    await authenticateSession({
      isGlobal: true,
      account_id: this.server.schema.accounts.first().id,
    });
    instances.role = this.server.create('role', {
      scopeId: 'global',
    });

    urls.scopes = `/scopes/global/roles/${instances.role.id}/scopes`;
  });

  test('it exists', function (assert) {
    assert.ok(controller);
  });

  test('isKeywordThis action returns true if id is GRANT_SCOPE_THIS', function (assert) {
    assert.ok(controller.isKeywordThis(GRANT_SCOPE_THIS));
    assert.notOk(controller.isKeywordThis(GRANT_SCOPE_CHILDREN));
  });

  test('isKeywordChildrenOrDescendants action returns true if id is GRANT_SCOPE_CHILDREN or GRANT_SCOPE_DESCENDANTS', function (assert) {
    assert.ok(controller.isKeywordChildrenOrDescendants(GRANT_SCOPE_CHILDREN));
    assert.ok(
      controller.isKeywordChildrenOrDescendants(GRANT_SCOPE_DESCENDANTS),
    );
    assert.notOk(controller.isKeywordChildrenOrDescendants(GRANT_SCOPE_THIS));
  });

  test('availableParentScopes returns expected object', async function (assert) {
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: instances.scopes.global.id },
    });
    instances.role.update({ grant_scope_ids: [instances.scopes.org.id] });
    await visit(urls.scopes);

    assert.deepEqual(controller.availableParentScopes, [
      { id: instances.scopes.global.id },
    ]);
  });

  test('scopeTypeOptions returns expected object', function (assert) {
    assert.deepEqual(controller.scopeTypeOptions, [
      { id: TYPE_SCOPE_ORG, name: 'Org' },
      { id: TYPE_SCOPE_PROJECT, name: 'Project' },
    ]);
  });

  test('filters returns expected entries', async function (assert) {
    await visit(urls.scopes);

    assert.ok(controller.filters.allFilters);
    assert.ok(controller.filters.selectedFilters);
  });

  test('handleSearchInput action sets expected values correctly', async function (assert) {
    const searchValue = 'test';
    controller.handleSearchInput({ target: { value: searchValue } });
    await waitUntil(() => controller.search === searchValue);

    assert.strictEqual(controller.page, 1);
    assert.strictEqual(controller.search, searchValue);
  });

  test('applyFilter action sets expected values correctly', function (assert) {
    const selectedItems = [TYPE_SCOPE_ORG];
    controller.applyFilter('types', selectedItems);

    assert.strictEqual(controller.page, 1);
    assert.deepEqual(controller.types, selectedItems);
  });
});
