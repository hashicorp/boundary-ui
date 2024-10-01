/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitUntil } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIntl } from 'ember-intl/test-support';
import sinon from 'sinon';

module(
  'Unit | Controller | scopes/scope/session-recordings/index',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en-us');

    let controller;
    let model;
    const originalDateNow = Date.now;
    let last24Hours, last3Days, last7Days;

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
      const timeStamp = 1726760348000; // Thursday, September 19, 2024 3:39:08 PM (GMT)
      sinon.stub(Date, 'now').returns(timeStamp);
      const now = new Date();
      last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      last3Days = new Date(now);
      last3Days.setDate(now.getDate() - 3);
      last7Days = new Date(now);
      last7Days.setDate(now.getDate() - 7);

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

    hooks.afterEach(function () {
      Date.now = originalDateNow;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
    });

    test('filters returns expected entries', function (assert) {
      assert.deepEqual(controller.filters.allFilters, {
        time: [
          {
            id: last24Hours.toISOString(),
            name: 'Last 24 hours',
          },
          {
            id: last3Days.toISOString(),
            name: 'Last 3 days',
          },
          {
            id: last7Days.toISOString(),
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
        time: [null],
        users: [],
        scopes: [],
        targets: [],
      });
    });

    test('timeOptions returns expected filter options', function (assert) {
      assert.deepEqual(controller.timeOptions, [
        {
          id: last24Hours.toISOString(),
          name: 'Last 24 hours',
        },
        {
          id: last3Days.toISOString(),
          name: 'Last 3 days',
        },
        {
          id: last7Days.toISOString(),
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
      // Date.now mock in beforeEach is causing waitUntil to fail so I set it
      // back to the originalDateNow before running this test
      Date.now = originalDateNow;
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
      controller.changeTimeFilter(last24Hours.toISOString(), this.onClose);

      assert.strictEqual(controller.page, 1);
      assert.deepEqual(controller.time, last24Hours.toISOString());
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
