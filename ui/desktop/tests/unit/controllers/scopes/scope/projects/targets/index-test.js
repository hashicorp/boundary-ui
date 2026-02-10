/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'desktop/tests/helpers/mirage';
import { setupBoundaryApiMock } from 'desktop/tests/helpers/boundary-api-mock';
import setupStubs from 'api/test-support/handlers/cache-daemon-search';
import { waitUntil, visit } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import {
  STATUS_SESSION_ACTIVE,
  STATUS_SESSION_PENDING,
  STATUS_SESSION_CANCELING,
} from 'api/models/session';
import {
  TYPE_TARGET_SSH,
  TYPE_TARGET_TCP,
  TYPE_TARGET_RDP,
} from 'api/models/target';

module(
  'Unit | Controller | scopes/scope/projects/targets/index',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupBoundaryApiMock(hooks);
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
      targets: null,
    };

    hooks.beforeEach(async function () {
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/projects/targets/index',
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
        scope: instances.scopes.org,
      });
      instances.session = this.server.create('session', {
        scope: instances.scopes.org,
        target: instances.target,
        status: STATUS_SESSION_ACTIVE,
      });

      urls.projectScope = `/scopes/${instances.scopes.org.id}/projects`;
      urls.targets = `${urls.projectScope}/targets`;

      window.boundary.isCacheDaemonRunning = () => true;
      this.stubCacheDaemonSearch('sessions', 'targets', 'aliases', 'sessions');
      await authenticateSession({ account_id: instances.account.id });
    });

    test('it exists', function (assert) {
      this.stubCacheDaemonSearch();
      assert.ok(controller);
      assert.ok(controller.refresh);
    });

    test('noResults returns falsy when targets exist', async function (assert) {
      await visit(urls.targets);

      assert.notOk(controller.noResults);
    });

    test('noResults returns truthy when no targets exist but there is a search term', async function (assert) {
      this.server.schema.targets.all().destroy();
      this.stubCacheDaemonSearch('sessions', 'targets', 'aliases', 'sessions');
      controller.search = 'target that does not exist';
      await visit(urls.targets);

      assert.ok(controller.noResults);
    });

    test('noTargets returns truthy when no targets exist', async function (assert) {
      this.server.schema.targets.all().destroy();
      this.stubCacheDaemonSearch('sessions', 'targets', 'aliases', 'sessions');
      await visit(urls.targets);

      assert.ok(controller.noTargets);
    });

    test('noTargets returns falsy when targets exist', async function (assert) {
      await visit(urls.targets);

      assert.notOk(controller.noTargets);
    });

    test('availableScopes returns all existing project scopes', async function (assert) {
      await visit(urls.targets);
      const project = await store.findRecord(
        'scope',
        instances.scopes.project.id,
      );

      assert.deepEqual(controller.availableScopes, [project]);
    });

    test('availableSessionOptions returns expected object', function (assert) {
      this.stubCacheDaemonSearch();

      assert.deepEqual(controller.availableSessionOptions, [
        { id: 'yes', name: 'Has active sessions' },
        { id: 'no', name: 'No active sessions' },
      ]);
    });

    test('sortedTargetSessions returns a limit of 10 items sorted by created time descending', async function (assert) {
      this.server.create('session', {
        scope: instances.scopes.org,
        target: instances.target,
        status: STATUS_SESSION_ACTIVE,
      });
      controller.selectedTarget = await store.findRecord(
        'target',
        instances.target.id,
      );
      this.stubCacheDaemonSearch('sessions', 'targets', 'aliases', 'sessions');
      await visit(urls.targets);

      const sortedSessions = controller.sortedTargetSessions;

      assert.true(sortedSessions.length <= 10);
      assert.true(
        sortedSessions[0].created_time >= sortedSessions[1].created_time,
      );
      assert.false(controller.showFlyoutViewMoreLink);
    });

    test('viewMoreLinkQueryParams returns expected object', async function (assert) {
      this.stubCacheDaemonSearch();
      controller.selectedTarget = instances.target;

      assert.deepEqual(controller.viewMoreLinkQueryParams, {
        targets: [instances.target.id],
        status: [STATUS_SESSION_ACTIVE, STATUS_SESSION_PENDING],
      });
    });

    test('targetTypeOptions returns expected target types', async function (assert) {
      this.stubCacheDaemonSearch();

      assert.deepEqual(controller.targetTypeOptions, [
        { id: TYPE_TARGET_TCP, name: 'Generic TCP' },
        { id: TYPE_TARGET_SSH, name: 'SSH' },
        { id: TYPE_TARGET_RDP, name: 'RDP' },
      ]);
    });

    test('filters returns expected entries', async function (assert) {
      await visit(urls.targets);

      assert.ok(controller.filters.allFilters);
      assert.ok(controller.filters.selectedFilters);
    });

    test('handleSearchInput action sets expected values correctly', async function (assert) {
      this.stubCacheDaemonSearch();
      const searchValue = 'test';
      controller.handleSearchInput({ target: { value: searchValue } });
      await waitUntil(() => controller.search === searchValue);

      assert.strictEqual(controller.page, 1);
      assert.strictEqual(controller.search, searchValue);
    });

    test('toggleSessionsFlyout action sets expected value correctly', async function (assert) {
      this.stubCacheDaemonSearch();
      controller.sessionsFlyoutActive = false;

      assert.false(controller.sessionsFlyoutActive);

      controller.toggleSessionsFlyout();

      assert.true(controller.sessionsFlyoutActive);

      controller.toggleSessionsFlyout();

      assert.false(controller.sessionsFlyoutActive);
    });

    test('applyFilter action sets expected values correctly', async function (assert) {
      this.stubCacheDaemonSearch();
      const selectedItems = ['yes'];
      controller.applyFilter('availableSessions', selectedItems);

      assert.strictEqual(controller.page, 1);
      assert.deepEqual(controller.availableSessions, selectedItems);
    });

    test('selectTarget action sets expected value correctly', async function (assert) {
      this.stubCacheDaemonSearch();

      assert.notOk(controller.selectedTarget);

      controller.selectTarget(instances.target);

      assert.deepEqual(controller.selectedTarget, instances.target);
    });

    test('connect action creates a session with correct info and cancelSession action updates session status', async function (assert) {
      const attrs = {
        session_id: instances.session.id,
        address: 'a_123',
        port: 'p_123',
      };
      window.boundary.cliExists = () => true;
      window.boundary.connectSession = () => attrs;
      await visit(urls.targets);
      const target = await store.findRecord('target', instances.target.id);
      const session = await store.findRecord('session', instances.session.id);

      assert.notOk(session.proxy_address);
      assert.notOk(session.proxy_port);

      await controller.connect(target);

      assert.strictEqual(session.proxy_address, attrs.address);
      assert.strictEqual(session.proxy_port, attrs.port);

      await controller.cancelSession(session);
      await visit(urls.projectScope);

      assert.strictEqual(session.status, STATUS_SESSION_CANCELING);
    });
  },
);
