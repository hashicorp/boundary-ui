/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
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
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | session recordings | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let featuresService;

  // Selectors
  const SESSION_RECORDING_TITLE = 'Session Recordings';
  const SEARCH_INPUT_SELECTOR = '.search-filtering [type="search"]';
  const NO_RESULTS_MSG_SELECTOR = '[data-test-no-session-recording-results]';
  const FILTER_TOGGLE_SELECTOR = (name) =>
    `[data-test-session-recordings-bar] div[name="${name}"] button`;
  const FILTER_APPLY_BUTTON = (name) =>
    `[data-test-session-recordings-bar] div[name="${name}"] div div:last-child button[type="button"]`;

  // Instances
  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
      project2: null,
    },
    target: null,
    target2: null,
    user: null,
    user2: null,
    sessionRecording: null,
    sessionRecording2: null,
  };

  // Urls
  const urls = {
    globalScope: null,
    sessionRecordings: null,
    sessionRecording: null,
    sessionRecording2: null,
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
    instances.scopes.project2 = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.target = this.server.create('target', {
      scope: instances.scopes.project,
    });
    instances.target2 = this.server.create('target', {
      scope: instances.scopes.project2,
    });
    instances.user = this.server.create('user');
    instances.user2 = this.server.create('user');
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
    instances.sessionRecording2 = this.server.create('session-recording', {
      scope: instances.scopes.global,
      create_time_values: {
        target: {
          id: instances.target2.id,
          name: instances.target2.name,
          scope: {
            id: instances.scopes.project2.id,
            name: instances.scopes.project2.name,
            parent_scope_id: instances.scopes.org.id,
          },
        },
        user: instances.user2.attrs,
      },
    });
    urls.globalScope = `/scopes/global`;
    urls.sessionRecordings = `${urls.globalScope}/session-recordings`;
    urls.sessionRecording = `${urls.sessionRecordings}/${instances.sessionRecording.id}/channels-by-connection`;
    urls.sessionRecording2 = `${urls.sessionRecordings}/${instances.sessionRecording2.id}/channels-by-connection`;

    featuresService = this.owner.lookup('service:features');
    featuresService.enable('ssh-session-recording');

    authenticateSession({});
  });

  test('users can navigate to session-recordings with proper authorization', async function (assert) {
    await visit(urls.globalScope);

    assert.true(
      instances.scopes.global.authorized_collection_actions[
        'session-recordings'
      ].includes('list'),
    );
    assert.dom(`[href="${urls.sessionRecordings}"]`).exists();
    assert.dom('[title="General"]').includesText(SESSION_RECORDING_TITLE);

    // Visit session recordings
    await click(`[href="${urls.sessionRecordings}"]`);
    assert.strictEqual(currentURL(), urls.sessionRecordings);
  });

  test('users cannot navigate to session-recordings without the list action', async function (assert) {
    instances.scopes.global.authorized_collection_actions[
      'session-recordings'
    ] = [];

    await visit(urls.globalScope);

    assert.false(
      instances.scopes.global.authorized_collection_actions[
        'session-recordings'
      ].includes('list'),
    );
    assert.dom('[title="General"]').doesNotIncludeText(SESSION_RECORDING_TITLE);
    assert.dom(`[href="${urls.sessionRecordings}"]`).doesNotExist();
  });

  test('user can search for a session recording by id', async function (assert) {
    await visit(urls.sessionRecordings);

    assert.dom(commonSelectors.HREF(urls.sessionRecording)).exists();
    assert.dom(commonSelectors.HREF(urls.sessionRecording2)).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, instances.sessionRecording.id);
    await waitUntil(
      () => findAll(commonSelectors.HREF(urls.sessionRecording2)).length === 0,
    );

    assert.dom(commonSelectors.HREF(urls.sessionRecording)).exists();
    assert.dom(commonSelectors.HREF(urls.sessionRecording2)).doesNotExist();
  });

  test('user can search for a session recording by id and get no results', async function (assert) {
    await visit(urls.sessionRecordings);

    assert.dom(commonSelectors.HREF(urls.sessionRecording)).exists();
    assert.dom(commonSelectors.HREF(urls.sessionRecording2)).exists();

    await fillIn(SEARCH_INPUT_SELECTOR, 'sr_404');
    await waitUntil(() => findAll(NO_RESULTS_MSG_SELECTOR).length === 1);

    assert.dom(commonSelectors.HREF(urls.sessionRecording)).doesNotExist();
    assert.dom(commonSelectors.HREF(urls.sessionRecording2)).doesNotExist();
    assert.dom(NO_RESULTS_MSG_SELECTOR).includesText('No results found');
  });

  test('user can filter session recordings by user', async function (assert) {
    await visit(urls.sessionRecordings);

    assert.dom('tbody tr').exists({ count: 2 });

    await click(FILTER_TOGGLE_SELECTOR('user'));
    await click(`input[value="${instances.user.id}"]`);
    await click(FILTER_APPLY_BUTTON('user'));

    assert.dom('tbody tr').exists({ count: 1 });
  });

  test('user can filter session recordings by scope', async function (assert) {
    await visit(urls.sessionRecordings);

    assert.dom('tbody tr').exists({ count: 2 });

    await click(FILTER_TOGGLE_SELECTOR('target'));
    await click(`input[value="${instances.target.id}"]`);
    await click(FILTER_APPLY_BUTTON('target'));

    assert.dom('tbody tr').exists({ count: 1 });
  });

  test('user can filter session recordings by target', async function (assert) {
    await visit(urls.sessionRecordings);

    assert.dom('tbody tr').exists({ count: 2 });

    await click(FILTER_TOGGLE_SELECTOR('scope'));
    await click(`input[value="${instances.target.scope.id}"]`);
    await click(FILTER_APPLY_BUTTON('scope'));

    assert.dom('tbody tr').exists({ count: 1 });
  });
});
