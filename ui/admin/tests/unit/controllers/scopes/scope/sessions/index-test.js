/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { waitUntil } from '@ember/test-helpers';

module('Unit | Controller | scopes/scope/sessions/index', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks, 'en-us');

  const session = {
    id: 's_123',
    status: 'active',
    created_time: '2024-03-12T20:44:14.808699Z',
  };
  const model = {
    sessions: [session],
    canListUsers: true,
    canListTargets: true,
    doSessionsExist: true,
    totalItems: 1,
  };

  test('it exists', function (assert) {
    let controller = this.owner.lookup(
      'controller:scopes/scope/sessions/index',
    );
    assert.ok(controller);
  });

  test('filters returns expected entries', function (assert) {
    let controller = this.owner.lookup(
      'controller:scopes/scope/sessions/index',
    );
    controller.set('model', model);
    assert.deepEqual(controller.filters.allFilters, {
      status: [
        {
          id: 'active',
          name: 'Active',
        },
        {
          id: 'pending',
          name: 'Pending',
        },
        {
          id: 'canceling',
          name: 'Canceling',
        },
        {
          id: 'terminated',
          name: 'Terminated',
        },
      ],
      targets: [],
      users: [],
    });
    assert.deepEqual(controller.filters.selectedFilters, {
      users: [],
      targets: [],
      status: ['active', 'pending', 'canceling'],
    });
  });

  test('sessionStatusOptions returns expected object', function (assert) {
    let controller = this.owner.lookup(
      'controller:scopes/scope/sessions/index',
    );
    assert.deepEqual(controller.sessionStatusOptions, [
      { id: 'active', name: 'Active' },
      { id: 'pending', name: 'Pending' },
      { id: 'canceling', name: 'Canceling' },
      { id: 'terminated', name: 'Terminated' },
    ]);
  });

  test('handleSearchInput action sets expected values correctly', async function (assert) {
    let controller = this.owner.lookup(
      'controller:scopes/scope/sessions/index',
    );
    const searchValue = 'test';
    controller.handleSearchInput({ target: { value: searchValue } });
    await waitUntil(() => controller.search === searchValue);

    assert.strictEqual(controller.page, 1);
    assert.strictEqual(controller.search, searchValue);
  });

  test('applyFilter action sets expected values correctly', function (assert) {
    let controller = this.owner.lookup(
      'controller:scopes/scope/sessions/index',
    );
    const selectedItems = ['admin'];
    controller.applyFilter('users', selectedItems);

    assert.strictEqual(controller.page, 1);
    assert.deepEqual(controller.users, selectedItems);
  });
});
