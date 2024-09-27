/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitUntil } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIntl } from 'ember-intl/test-support';

module(
  'Unit | Controller | scopes/scope/session-recordings/index',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en-us');

    let controller;
    let model;
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const threeDaysPast = new Date(midnight);
    threeDaysPast.setDate(midnight.getDate() - 3);
    const sevenDaysPast = new Date(midnight);
    sevenDaysPast.setDate(midnight.getDate() - 7);

    const instances = {
      scopes: {
        global: null,
        org: null,
        project: null,
      },
      target: null,
      user: null,
      sessionRecording: null,
      storageBucket: null,
    };

    hooks.beforeEach(function () {
      controller = this.owner.lookup(
        'controller:scopes/scope/session-recordings/index',
      );

      instances.scopes.global = this.server.create('scope', { id: 'global' });
      instances.scopes.org = this.server.create('scope', {
        type: 'org',
        scope: { id: 'global', type: 'global' },
      });
      instances.scopes.project = this.server.create('scope', {
        type: 'project',
        parent_scope_id: instances.scopes.org.id,
        scope: { id: instances.scopes.org.id, type: 'org' },
      });
      instances.target = this.server.create('target', {
        scope: instances.scopes.project,
      });
      instances.user = this.server.create('user');
      instances.sessionRecording = this.server.create('session-recording', {
        scope: instances.scopes.global,
        create_time_values: {
          target: {
            id: instances.target.id,
            name: instances.target.name,
            scope: {
              id: instances.scopes.project.id,
              name: instances.scopes.project.name,
              parent_scope_id: instances.scopes.org.id,
            },
          },
          user: instances.user.attrs,
        },
      });
      instances.storageBucket = this.server.create('storage-bucket', {
        scope: instances.scopes.global,
      });
      model = {
        sessionRecordings: [instances.sessionRecording],
        doSessionRecordingsExist: true,
        allSessionRecordings: [instances.sessionRecording],
        totalItems: 1,
        doStorageBucketsExist: true,
      };
      controller.set('model', model);
    });

    test('it exists', function (assert) {
      assert.ok(controller);
    });

    test('filters returns expected entries', function (assert) {
      assert.deepEqual(controller.filters.allFilters, {
        times: [
          {
            id: midnight.toISOString(),
            name: 'Today',
          },
          {
            id: threeDaysPast.toISOString(),
            name: 'Last 3 days',
          },
          {
            id: sevenDaysPast.toISOString(),
            name: 'Last 7 days',
          },
        ],
        users: [{ id: instances.user.id, name: instances.user.name }],
        scopes: [
          {
            id: instances.scopes.project.id,
            name: instances.scopes.project.name,
            parent_scope_id: instances.scopes.project.parent_scope_id,
          },
        ],
        targets: [{ id: instances.target.id, name: instances.target.name }],
      });
      assert.deepEqual(controller.filters.selectedFilters, {
        times: [],
        users: [],
        scopes: [],
        targets: [],
      });
    });

    test('timeOptions returns expected filter options', function (assert) {
      assert.deepEqual(controller.timeOptions, [
        {
          id: midnight.toISOString(),
          name: 'Today',
        },
        {
          id: threeDaysPast.toISOString(),
          name: 'Last 3 days',
        },
        {
          id: sevenDaysPast.toISOString(),
          name: 'Last 7 days',
        },
      ]);
    });

    test('projectScopes returns an array of unique projects', function (assert) {
      assert.deepEqual(controller.projectScopes, [
        {
          id: instances.scopes.project.id,
          name: instances.scopes.project.name,
          parent_scope_id: instances.scopes.project.parent_scope_id,
        },
      ]);
    });

    test('handleSearchInput action sets expected values correctly', async function (assert) {
      const searchValue = 'test';
      controller.handleSearchInput({ target: { value: searchValue } });
      await waitUntil(() => controller.search === searchValue);

      assert.strictEqual(controller.page, 1);
      assert.strictEqual(controller.search, searchValue);
    });

    test('applyFilter action sets expected values correctly', function (assert) {
      const selectedItems = ['admin'];
      controller.applyFilter('users', selectedItems);

      assert.strictEqual(controller.page, 1);
      assert.deepEqual(controller.users, selectedItems);
    });

    test('changeTimeFilter action sets the time filter', function (assert) {
      assert.expect(3);
      this.onClose = () => assert.ok(true, 'onClose was called');
      controller.changeTimeFilter(midnight.toISOString(), this.onClose);

      assert.strictEqual(controller.page, 1);
      assert.deepEqual(controller.times, [midnight.toISOString()]);
    });

    test('refresh action calls refreshAll', async function (assert) {
      assert.expect(2);
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
  },
);
