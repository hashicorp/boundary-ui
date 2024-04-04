/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  click,
  fillIn,
  waitUntil,
  findAll,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';
import { TYPE_TARGET_TCP, TYPE_TARGET_SSH } from 'api/models/target';

module('Acceptance | sessions | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  const SEARCH_INPUT_SELECTOR = '.search-filtering [type="search"]';
  const NO_RESULTS_MSG_SELECTOR = '[data-test-no-session-results]';
  const SESSION_ID_SELECTOR = (id) => `[data-test-session="${id}"]`;
  const FILTER_TOGGLE_SELECTOR = (name) =>
    `[data-test-sessions-bar] div[name="${name}"] button`;
  const FILTER_APPLY_BUTTON = (name) =>
    `[data-test-sessions-bar] div[name="${name}"] div div:last-child button[type="button"]`;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    sessions: null,
    tcpTarget: null,
    sshTarget: null,
    admin: null,
    dev: null,
  };
  const urls = {
    orgScope: null,
    projectScope: null,
    sessions: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.admin = this.server.create('user', {
      scopeId: 'global',
      name: 'admin',
    });
    instances.dev = this.server.create('user', {
      scopeId: 'global',
      name: 'dev',
    });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: instances.scopes.org.type },
    });
    this.server.createList(
      'group',
      1,
      { scope: instances.scopes.org },
      'withMembers',
    );
    instances.tcpTarget = this.server.create(
      'target',
      { scope: instances.scopes.project, type: TYPE_TARGET_TCP },
      'withAssociations',
    );
    instances.sshTarget = this.server.create(
      'target',
      { scope: instances.scopes.project, type: TYPE_TARGET_SSH },
      'withAssociations',
    );
    instances.sessions = this.server.createList(
      'session',
      3,
      {
        scope: instances.scopes.project,
        status: 'active',
      },
      'withAssociations',
    );
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.sessions = `${urls.projectScope}/sessions`;

    authenticateSession({});
  });

  test('visiting sessions', async function (assert) {
    await visit(urls.projectScope);
    await a11yAudit();

    await click(`[href="${urls.sessions}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.sessions);
    assert.dom('tbody tr').exists({ count: instances.sessions.length });
  });

  test('users cannot navigate to sessions tab without proper authorization', async function (assert) {
    await visit(urls.orgScope);
    await a11yAudit();
    instances.scopes.project.authorized_collection_actions.sessions =
      instances.scopes.project.authorized_collection_actions.sessions.filter(
        (item) => item !== 'list',
      );

    await click(`[href="${urls.projectScope}"]`);

    assert.false(
      instances.scopes.project.authorized_collection_actions.sessions.includes(
        'list',
      ),
    );

    assert
      .dom('[title="Resources"] a:first-of-type')
      .doesNotIncludeText('Sessions');
  });

  test('users can navigate to sessions with proper authorization', async function (assert) {
    await visit(urls.orgScope);

    await click(`[href="${urls.projectScope}"]`);

    assert.true(
      instances.scopes.project.authorized_collection_actions.sessions.includes(
        'list',
      ),
    );
    assert.dom(`[href="${urls.sessions}"]`).exists();
  });

  test('visiting sessions without users or targets is OK', async function (assert) {
    await visit(urls.projectScope);
    instances.sessions[0].update({
      userId: null,
      targetId: null,
    });

    await click(`[href="${urls.sessions}"]`);

    assert.dom('tbody tr').exists({ count: instances.sessions.length });
  });

  test('cancelling a session', async function (assert) {
    await visit(urls.projectScope);

    await click(`[href="${urls.sessions}"]`);
    await click('tbody tr:first-child td:last-child button');

    assert.dom('[role="alert"] .rose-notification-header').hasText('Success');
  });

  test('cancelling a session with error shows notification', async function (assert) {
    await visit(urls.projectScope);
    this.server.post('/sessions/:id_method', () => new Response(400));

    await click(`[href="${urls.sessions}"]`);
    await click('tbody tr:first-child td:last-child button');

    assert.dom('[role="alert"] .rose-notification-header').hasText('Error');
  });

  test('users can link to docs page for sessions', async function (assert) {
    await visit(urls.projectScope);

    await click(`[href="${urls.sessions}"]`);

    assert
      .dom(`[href="https://boundaryproject.io/help/admin-ui/sessions"]`)
      .exists();
  });

  test('user can search for a specific session by id', async function (assert) {
    await visit(urls.projectScope);
    const sessionId = instances.sessions[0].id;

    await click(`[href="${urls.sessions}"]`);
    await fillIn(SEARCH_INPUT_SELECTOR, sessionId);
    await waitUntil(() => findAll(SESSION_ID_SELECTOR(sessionId)).length === 1);

    assert.dom(SESSION_ID_SELECTOR(sessionId)).hasText(sessionId);
  });

  test('user can search for sessions and get no results', async function (assert) {
    await visit(urls.projectScope);
    const sessionId = 'fake session that does not exist';

    await click(`[href="${urls.sessions}"]`);
    await fillIn(SEARCH_INPUT_SELECTOR, sessionId);
    await waitUntil(() => findAll(NO_RESULTS_MSG_SELECTOR).length === 1);

    assert.dom(NO_RESULTS_MSG_SELECTOR).includesText('No results found');
  });

  test('user can filter for sessions by user', async function (assert) {
    await visit(urls.projectScope);
    instances.sessions[2].update({
      userId: instances.dev.id,
    });

    await click(`[href="${urls.sessions}"]`);
    await click(FILTER_TOGGLE_SELECTOR('User'));
    await click(`input[value="${instances.dev.id}"]`);
    await click(FILTER_APPLY_BUTTON('User'));

    assert.dom(SESSION_ID_SELECTOR(instances.sessions[2].id)).exists();
    assert.dom('tbody tr').exists({ count: 1 });
  });

  test('user can filter for sessions by target', async function (assert) {
    await visit(urls.projectScope);
    instances.sessions[2].update({
      targetId: instances.sshTarget.id,
    });

    await click(`[href="${urls.sessions}"]`);
    await click(FILTER_TOGGLE_SELECTOR('Target'));
    await click(`input[value="${instances.sshTarget.id}"]`);
    await click(FILTER_APPLY_BUTTON('Target'));

    assert.dom(SESSION_ID_SELECTOR(instances.sessions[2].id)).exists();
    assert.dom('tbody tr').exists({ count: 1 });
  });

  test('user can filter for sessions by status', async function (assert) {
    await visit(urls.projectScope);

    await click(`[href="${urls.sessions}"]`);
    await click(FILTER_TOGGLE_SELECTOR('Status'));
    await click('input[value="active"]');
    await click(FILTER_APPLY_BUTTON('Status'));

    assert.dom(NO_RESULTS_MSG_SELECTOR).includesText('No results found');
  });
});
