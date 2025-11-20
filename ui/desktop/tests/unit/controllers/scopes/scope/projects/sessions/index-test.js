/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'api/test-support/helpers/mirage';
import setupStubs from 'api/test-support/handlers/cache-daemon-search';
import { visit } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import {
  STATUS_SESSION_ACTIVE,
  STATUS_SESSION_PENDING,
  STATUS_SESSION_CANCELING,
  STATUS_SESSION_TERMINATED,
} from 'api/models/session';

module(
  'Unit | Controller | scopes/scope/projects/sessions/index',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupStubs(hooks);
    setupIntl(hooks, 'en-us');

    let store;
    let controller;

    const instances = {
      scopes: {
        global: null,
        org: null,
        project: null,
      },
      target: null,
      session: null,
    };

    const urls = {
      projectScope: null,
      sessions: null,
    };

    hooks.beforeEach(async function () {
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/projects/sessions/index',
      );

      instances.scopes.global = this.server.create(
        'scope',
        { id: 'global' },
        'withGlobalAuth',
      );
      instances.account = this.server.schema.accounts.first();
      instances.scopes.org = this.server.create('scope', {
        type: 'org',
        scope: { id: 'global', type: 'global' },
      });
      instances.scopes.project = this.server.create('scope', {
        type: 'project',
        scope: { id: instances.scopes.org.id, type: 'org' },
      });
      instances.target = this.server.create('target', {
        scope: instances.scopes.project,
      });
      instances.session = this.server.create('session', {
        scope: instances.scopes.project,
        target: instances.target,
        status: STATUS_SESSION_ACTIVE,
      });

      urls.projectScope = `/scopes/${instances.scopes.org.id}/projects`;
      urls.sessions = `${urls.projectScope}/sessions`;

      this.ipcStub.withArgs('isCacheDaemonRunning').returns(true);
      this.stubCacheDaemonSearch('sessions', 'sessions', 'targets');
      await authenticateSession({ account_id: instances.account.id });
    });

    test('it exists', function (assert) {
      this.stubCacheDaemonSearch();
      assert.ok(controller);
    });

    test('sortedSessions returns a sessions sorted by status', async function (assert) {
      this.server.create('session', {
        scope: instances.scopes.org,
        target: instances.target,
        status: STATUS_SESSION_CANCELING,
      });
      this.stubCacheDaemonSearch('sessions', 'sessions', 'targets');
      await visit(urls.sessions);

      const sortedSessions = controller.sortedSessions;

      assert.strictEqual(sortedSessions[0].status, STATUS_SESSION_ACTIVE);
      assert.strictEqual(sortedSessions[1].status, STATUS_SESSION_CANCELING);
    });

    test('sessionStatusOptions returns expected object', function (assert) {
      this.stubCacheDaemonSearch();

      assert.deepEqual(controller.sessionStatusOptions, [
        { id: STATUS_SESSION_ACTIVE, name: 'Active' },
        { id: STATUS_SESSION_PENDING, name: 'Pending' },
        { id: STATUS_SESSION_CANCELING, name: 'Canceling' },
        { id: STATUS_SESSION_TERMINATED, name: 'Terminated' },
      ]);
    });

    test('availableScopes returns all existing project scopes', async function (assert) {
      await visit(urls.sessions);
      const project = await store.findRecord(
        'scope',
        instances.scopes.project.id,
      );

      assert.deepEqual(controller.availableScopes, [project]);
    });

    test('filters returns expected entries', async function (assert) {
      await visit(urls.sessions);

      assert.ok(controller.filters.allFilters);
      assert.ok(controller.filters.selectedFilters);
    });

    test('applyFilter action sets expected values correctly', async function (assert) {
      this.stubCacheDaemonSearch();
      const selectedItems = ['yes'];
      controller.applyFilter('availableSessions', selectedItems);

      assert.strictEqual(controller.page, 1);
      assert.deepEqual(controller.availableSessions, selectedItems);
    });

    test('cancelSession action updates session status', async function (assert) {
      await visit(urls.sessions);

      const session = await store.findRecord('session', instances.session.id);

      assert.strictEqual(session.status, STATUS_SESSION_ACTIVE);

      await controller.cancelSession(session);

      assert.strictEqual(session.status, STATUS_SESSION_CANCELING);
    });
  },
);
