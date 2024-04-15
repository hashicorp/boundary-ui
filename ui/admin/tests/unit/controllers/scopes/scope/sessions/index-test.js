/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';
import { waitUntil } from '@ember/test-helpers';

module('Unit | Controller | scopes/scope/sessions/index', function (hooks) {
  setupTest(hooks);

  const session = {
    id: 's_123',
    status: 'active',
    created_time: '2024-03-12T20:44:14.808699Z',
  };
  const user = { id: 'u_123', name: 'admin' };
  const target = { id: 't_123', name: 'target' };
  const model = {
    sessions: [session],
    associatedUsers: [user],
    associatedTargets: [target],
    allSessions: [session],
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
      targets: [
        {
          id: 't_123',
          name: 'target',
        },
      ],
      users: [
        {
          id: 'u_123',
          name: 'admin',
        },
      ],
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

  test('refresh action calls refreshAll', async function (assert) {
    assert.expect(2);
    let controller = this.owner.lookup(
      'controller:scopes/scope/sessions/index',
    );
    controller.set('target', {
      send(actionName, ...args) {
        assert.strictEqual(actionName, 'refreshAll');
        assert.deepEqual(
          args,
          [],
          'refreshAll was called with the correct arguments',
        );
      },
    });

    await controller.refresh();
  });
});
