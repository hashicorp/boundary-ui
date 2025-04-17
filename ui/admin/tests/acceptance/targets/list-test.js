/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import {
  visit,
  click,
  fillIn,
  waitFor,
  currentRouteName,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { TYPE_TARGET_TCP, TYPE_TARGET_SSH } from 'api/models/target';
import { STATUS_SESSION_ACTIVE } from 'api/models/session';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | targets | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  const SEARCH_INPUT_SELECTOR = '.search-filtering [type="search"]';
  const NO_RESULTS_MSG_SELECTOR = '[data-test-no-target-results]';
  const FILTER_DROPDOWN_SELECTOR = (name) =>
    `.search-filtering [name="${name}"] button`;
  const FILTER_APPLY_BUTTON_SELECTOR =
    '.search-filtering [data-test-dropdown-apply-button]';
  const ACTIVE_SESSIONS_SELECTOR = (id) =>
    `tbody [data-test-targets-table-row="${id}"] .hds-table__td:nth-child(3) a`;
  const SESSIONS_ID_SELECTOR = (id) =>
    `tbody [data-test-sessions-table-row="${id}"] .hds-table__td:first-child`;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    tcpTarget: null,
    sshTarget: null,
    session: null,
  };

  const urls = {
    orgScope: null,
    projectScope: null,
    targets: null,
    tcpTarget: null,
    sshTarget: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.tcpTarget = this.server.create('target', {
      type: TYPE_TARGET_TCP,
      scope: instances.scopes.project,
    });
    instances.sshTarget = this.server.create('target', {
      id: 'target-1',
      type: TYPE_TARGET_SSH,
      scope: instances.scopes.project,
    });
    instances.session = this.server.create('session', {
      targetId: instances.sshTarget.id,
      scope: instances.scopes.project,
      status: STATUS_SESSION_ACTIVE,
    });
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    urls.tcpTarget = `${urls.targets}/${instances.tcpTarget.id}`;
    urls.sshTarget = `${urls.targets}/${instances.sshTarget.id}`;

    const featuresService = this.owner.lookup('service:features');
    featuresService.enable('ssh-target');
    await authenticateSession({});
  });

  test('can navigate to targets with proper authorization', async function (assert) {
    await visit(urls.orgScope);

    await click(`[href="${urls.projectScope}"]`);

    assert.true(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'list',
      ),
    );
    assert.true(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'create',
      ),
    );
    assert.dom(`[href="${urls.targets}"]`).exists();
  });

  test('user cannot navigate to index without either list or create actions', async function (assert) {
    instances.scopes.project.authorized_collection_actions.targets = [];
    await visit(urls.orgScope);

    await click(`[href="${urls.projectScope}"]`);

    assert.false(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'list',
      ),
    );
    assert.false(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'create',
      ),
    );
    assert
      .dom(commonSelectors.SIDEBAR_NAV_CONTENT)
      .doesNotIncludeText('Targets');
  });

  test('user can navigate to index with only create action', async function (assert) {
    instances.scopes.project.authorized_collection_actions.targets =
      instances.scopes.project.authorized_collection_actions.targets.filter(
        (item) => item !== 'list',
      );
    await visit(urls.orgScope);

    await click(`[href="${urls.projectScope}"]`);

    assert.true(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'create',
      ),
    );
    assert.false(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'list',
      ),
    );
    assert.dom(`[href="${urls.targets}"]`).exists();
  });

  test('user can navigate to index with only list action', async function (assert) {
    instances.scopes.project.authorized_collection_actions.targets =
      instances.scopes.project.authorized_collection_actions.targets.filter(
        (item) => item !== 'create',
      );
    await visit(urls.orgScope);

    await click(`[href="${urls.projectScope}"]`);

    assert.false(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'create',
      ),
    );
    assert.true(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'list',
      ),
    );
    assert.dom(`[href="${urls.targets}"]`).exists();
  });

  test('user can search for a specifc target by id', async function (assert) {
    await visit(urls.projectScope);

    await click(`[href="${urls.targets}"]`);

    assert.dom(`[href="${urls.tcpTarget}"]`).exists();
    assert.dom(`[href="${urls.sshTarget}"]`).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, instances.sshTarget.id);
    await waitFor(`[href="${urls.tcpTarget}"]`, { count: 0 });

    assert.dom(`[href="${urls.sshTarget}"]`).exists();
    assert.dom(`[href="${urls.tcpTarget}"]`).doesNotExist();
  });

  test('user can search for targets and get no results', async function (assert) {
    await visit(urls.projectScope);

    await click(`[href="${urls.targets}"]`);

    assert.dom(`[href="${urls.tcpTarget}"]`).exists();
    assert.dom(`[href="${urls.sshTarget}"]`).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, 'fake target that does not exist');
    await waitFor(NO_RESULTS_MSG_SELECTOR, { count: 1 });

    assert.dom(`[href="${urls.sshTarget}"]`).doesNotExist();
    assert.dom(`[href="${urls.tcpTarget}"]`).doesNotExist();
    assert.dom(NO_RESULTS_MSG_SELECTOR).includesText('No results found');
  });

  test('user can filter for targets by type', async function (assert) {
    await visit(urls.projectScope);

    await click(`[href="${urls.targets}"]`);

    assert.dom(`[href="${urls.tcpTarget}"]`).exists();
    assert.dom(`[href="${urls.sshTarget}"]`).exists();

    await click(FILTER_DROPDOWN_SELECTOR('type'));
    await click(`input[value="tcp"]`);
    await click(FILTER_APPLY_BUTTON_SELECTOR);

    assert.dom(`[href="${urls.sshTarget}"]`).doesNotExist();
    assert.dom(`[href="${urls.tcpTarget}"]`).exists();
  });

  test('user can filter for targets by active sessions', async function (assert) {
    await visit(urls.projectScope);

    await click(`[href="${urls.targets}"]`);

    assert.dom(`[href="${urls.tcpTarget}"]`).exists();
    assert.dom(`[href="${urls.sshTarget}"]`).exists();

    await click(FILTER_DROPDOWN_SELECTOR('active-sessions'));
    await click(`input[value="yes"]`);
    await click(FILTER_APPLY_BUTTON_SELECTOR);

    assert.dom(`[href="${urls.sshTarget}"]`).exists();
    assert.dom(`[href="${urls.tcpTarget}"]`).doesNotExist();
  });

  test('active sessions filter is hidden if user does not have permission to list sessions', async function (assert) {
    instances.scopes.project.authorized_collection_actions.sessions =
      instances.scopes.project.authorized_collection_actions.sessions.filter(
        (item) => item !== 'list',
      );
    await visit(urls.projectScope);

    await click(`[href="${urls.targets}"]`);

    assert.dom(FILTER_DROPDOWN_SELECTOR('active-sessions')).doesNotExist();
  });

  test('user can navigate to active sessions from targets table', async function (assert) {
    await visit(urls.projectScope);

    await click(`[href="${urls.targets}"]`);
    await click(ACTIVE_SESSIONS_SELECTOR(instances.sshTarget.id));

    assert.strictEqual(currentRouteName(), 'scopes.scope.sessions.index');
    assert.dom(SESSIONS_ID_SELECTOR(instances.session.id)).exists();
  });
});
