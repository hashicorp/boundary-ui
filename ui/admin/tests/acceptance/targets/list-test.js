/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
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
import { TYPE_TARGET_TCP, TYPE_TARGET_SSH } from 'api/models/target';

module('Acceptance | targets | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  const SEARCH_INPUT_SELECTOR = '.search-filtering [type="search"]';
  const NO_RESULTS_MSG_SELECTOR = '[data-test-no-target-results]';
  const TYPE_FILTER_DROPDOWN_SELECTOR =
    '.search-filtering [name="type"] button';
  const TCP_TYPE_FILTER_OPTION_SELECTOR =
    '.search-filtering [name="type"] [data-test-checkbox="tcp"]';
  const FILTER_APPLY_BUTTON_SELECTOR =
    '.search-filtering [data-test-dropdown-apply-button]';
  const ACTIVE_SESSIONS_FILTER_DROPDOWN_SELECTOR =
    '.search-filtering [name="active-sessions"] button';
  const YES_FILTER_OPTION_SELECTOR =
    '.search-filtering [name="active-sessions"] [data-test-checkbox="yes"]';

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    tcpTarget: null,
    sshTarget: null,
  };

  const urls = {
    orgScope: null,
    projectScope: null,
    targets: null,
    tcpTarget: null,
    sshTarget: null,
  };

  hooks.beforeEach(function () {
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
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    urls.tcpTarget = `${urls.targets}/${instances.tcpTarget.id}`;
    urls.sshTarget = `${urls.targets}/${instances.sshTarget.id}`;

    const featuresService = this.owner.lookup('service:features');
    featuresService.enable('ssh-target');
    authenticateSession({});
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
      .dom('[title="Resources"] a:nth-of-type(2)')
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
    await waitUntil(() => findAll(`[href="${urls.tcpTarget}"]`).length === 0);

    assert.dom(`[href="${urls.sshTarget}"]`).exists();
    assert.dom(`[href="${urls.tcpTarget}"]`).doesNotExist();
  });

  test('user can search for targets and get no results', async function (assert) {
    await visit(urls.projectScope);

    await click(`[href="${urls.targets}"]`);

    assert.dom(`[href="${urls.tcpTarget}"]`).exists();
    assert.dom(`[href="${urls.sshTarget}"]`).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, 'fake target that does not exist');
    await waitUntil(() => findAll(NO_RESULTS_MSG_SELECTOR).length === 1);

    assert.dom(`[href="${urls.sshTarget}"]`).doesNotExist();
    assert.dom(`[href="${urls.tcpTarget}"]`).doesNotExist();
    assert.dom(NO_RESULTS_MSG_SELECTOR).includesText('No results found');
  });

  test('user can filter for targets by type', async function (assert) {
    await visit(urls.projectScope);

    await click(`[href="${urls.targets}"]`);

    assert.dom(`[href="${urls.tcpTarget}"]`).exists();
    assert.dom(`[href="${urls.sshTarget}"]`).exists();

    await click(TYPE_FILTER_DROPDOWN_SELECTOR);
    await click(TCP_TYPE_FILTER_OPTION_SELECTOR);
    await click(FILTER_APPLY_BUTTON_SELECTOR);
    await waitUntil(() => findAll(`[href="${urls.sshTarget}"]`).length === 0);

    assert.dom(`[href="${urls.sshTarget}"]`).doesNotExist();
    assert.dom(`[href="${urls.tcpTarget}"]`).exists();
  });

  test('user can filter for targets by active sessions', async function (assert) {
    await visit(urls.projectScope);

    await click(`[href="${urls.targets}"]`);

    assert.dom(`[href="${urls.tcpTarget}"]`).exists();
    assert.dom(`[href="${urls.sshTarget}"]`).exists();

    await click(ACTIVE_SESSIONS_FILTER_DROPDOWN_SELECTOR);
    await click(YES_FILTER_OPTION_SELECTOR);
    await click(FILTER_APPLY_BUTTON_SELECTOR);
    await waitUntil(() => findAll(NO_RESULTS_MSG_SELECTOR).length === 1);

    assert.dom(`[href="${urls.sshTarget}"]`).doesNotExist();
    assert.dom(`[href="${urls.tcpTarget}"]`).doesNotExist();
    assert.dom(NO_RESULTS_MSG_SELECTOR).includesText('No results found');
  });
});
