/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'desktop/tests/helpers';
import { Response } from 'miragejs';
import WindowMockIPC from '../../../helpers/window-mock-ipc';
import {
  currentSession,
  invalidateSession,
} from 'ember-simple-auth/test-support';
import {
  STATUS_SESSION_ACTIVE,
  STATUS_SESSION_PENDING,
  STATUS_SESSION_CANCELING,
  STATUS_SESSION_TERMINATED,
} from 'api/models/session';
import setupStubs from 'api/test-support/handlers/cache-daemon-search';
import { setRunOptions } from 'ember-a11y-testing/test-support';
import sinon from 'sinon';

module('Acceptance | projects | sessions | index', function (hooks) {
  setupApplicationTest(hooks);
  setupStubs(hooks);

  const APP_STATE_TITLE =
    '[data-test-no-sessions] .hds-application-state__title';

  const instances = {
    scopes: {
      global: null,
      org: null,
      org2: null,
      project: null,
      project2: null,
    },
    authMethods: {
      global: null,
    },
    user: null,
    target: null,
    target2: null,
    session: null,
    session2: null,
  };

  const urls = {
    scopes: {
      global: null,
      org: null,
      org2: null,
    },
    authenticate: {
      global: null,
      methods: {
        global: null,
      },
    },
    projects: null,
    projects2: null,
    sessions: null,
    sessions2: null,
    session: null,
  };

  const setDefaultClusterUrl = (test) => {
    const windowOrigin = window.location.origin;
    const clusterUrl = test.owner.lookup('service:clusterUrl');
    clusterUrl.rendererClusterUrl = windowOrigin;
  };

  hooks.beforeEach(async function () {
    // create scopes
    instances.scopes.global = this.server.schema.scopes.find('global');
    const globalScope = { id: 'global', type: 'global' };
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: globalScope,
    });
    const orgScope = { id: instances.scopes.org.id, type: 'org' };
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: orgScope,
    });
    instances.scopes.org2 = this.server.create('scope', {
      type: 'org',
      scope: globalScope,
    });
    const org2Scope = { id: instances.scopes.org2.id, type: 'org' };
    instances.scopes.project2 = this.server.create('scope', {
      type: 'project',
      scope: org2Scope,
    });

    // create resources
    instances.authMethods.global = this.server.schema.authMethods.first();
    instances.target = this.server.create(
      'target',
      { scope: instances.scopes.project },
      'withAssociations',
    );
    instances.user = this.server.schema.users.first();
    instances.session = this.server.create(
      'session',
      {
        scope: instances.scopes.project,
        target: instances.target,
        status: STATUS_SESSION_ACTIVE,
        user: instances.user,
      },
      'withAssociations',
    );
    // create resources in second org
    instances.target2 = this.server.create(
      'target',
      { scope: instances.scopes.project2 },
      'withAssociations',
    );
    instances.session2 = this.server.create(
      'session',
      {
        scope: instances.scopes.project2,
        target: instances.target2,
        status: STATUS_SESSION_ACTIVE,
        user: instances.user,
      },
      'withAssociations',
    );

    urls.scopes.global = `/scopes/${instances.scopes.global.id}`;
    urls.scopes.org = `/scopes/${instances.scopes.org.id}`;
    urls.scopes.org2 = `/scopes/${instances.scopes.org2.id}`;
    urls.authenticate.global = `${urls.scopes.global}/authenticate`;
    urls.authenticate.methods.global = `${urls.authenticate.global}/${instances.authMethods.global.id}`;
    urls.projects = `${urls.scopes.org}/projects`;
    urls.projects2 = `${urls.scopes.org2}/projects`;
    urls.globalSessions = `${urls.scopes.global}/projects/sessions`;
    urls.sessions = `${urls.projects}/sessions`;
    urls.sessions2 = `${urls.projects2}/sessions`;
    urls.session = `${urls.projects}/sessions/${instances.session.id}`;

    // Mock the postMessage interface used by IPC.
    this.owner.register('service:browser/window', WindowMockIPC);
    setDefaultClusterUrl(this);

    this.ipcStub.withArgs('isCacheDaemonRunning').returns(true);
    this.stubCacheDaemonSearch('sessions', 'sessions', 'targets');

    // mock RDP service calls
    let rdpService = this.owner.lookup('service:rdp');
    sinon.stub(rdpService, 'initialize').resolves();
  });

  test('visiting index while unauthenticated redirects to global authenticate method', async function (assert) {
    await invalidateSession();
    this.stubCacheDaemonSearch();

    await visit(urls.sessions);

    assert.notOk(currentSession().isAuthenticated);
    assert.strictEqual(currentURL(), urls.authenticate.methods.global);
  });

  test('visiting index', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const sessionsCount = this.server.schema.sessions.all().models.length;
    await visit(urls.projects);

    await click(`[href="${urls.sessions}"]`);

    assert.strictEqual(currentURL(), urls.sessions);
    assert.dom('.hds-segmented-group').exists();
    assert.dom('tbody tr').exists({ count: sessionsCount });
  });

  test('visiting empty sessions', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.server.schema.sessions.all().destroy();
    this.stubCacheDaemonSearch('sessions', 'sessions');
    await visit(urls.projects);

    await click(`[href="${urls.sessions}"]`);

    assert.dom(APP_STATE_TITLE).hasText('No Sessions Available');
  });

  test('visiting sessions without targets is OK', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.session.update({ targetId: undefined });
    const sessionsCount = this.server.schema.sessions.all().models.length;
    await visit(urls.projects);

    await click(`[href="${urls.sessions}"]`);

    assert.strictEqual(currentURL(), urls.sessions);
    assert.dom('tbody tr').exists({ count: sessionsCount });
  });

  test('visiting a session', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.projects);

    await click(`[href="${urls.sessions}"]`);
    await click(`[data-test-session-detail-link="${instances.session.id}"]`);

    assert.strictEqual(currentURL(), urls.session);
  });

  test('can link to an active session', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.projects);

    await click(`[href="${urls.sessions}"]`);
    await visit(urls.sessions);

    assert
      .dom(`[data-test-session-detail-link="${instances.session.id}"]`)
      .isVisible();
  });

  test('can link to an active session with read:self permissions', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.session.update({ authorized_actions: ['read:self'] });
    this.stubCacheDaemonSearch('sessions', 'sessions', 'targets');
    await visit(urls.projects);

    await click(`[href="${urls.sessions}"]`);

    assert
      .dom(`[data-test-session-detail-link="${instances.session.id}"]`)
      .isVisible();
  });

  test('can link to a pending session', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.session.update({ status: STATUS_SESSION_PENDING });
    this.stubCacheDaemonSearch('sessions', 'sessions', 'targets');
    await visit(urls.projects);

    await click(`[href="${urls.sessions}"]`);

    assert
      .dom(`[data-test-session-detail-link="${instances.session.id}"]`)
      .isVisible();
  });

  test('can link to session even without read permissions', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.session.update({ authorized_actions: [] });
    this.stubCacheDaemonSearch('sessions', 'sessions', 'targets');
    await visit(urls.projects);

    await click(`[href="${urls.sessions}"]`);

    assert
      .dom(`[data-test-session-detail-link="${instances.session.id}"]`)
      .isVisible();
  });

  test('cannot link to a canceling session', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.session.update({ status: STATUS_SESSION_CANCELING });
    this.stubCacheDaemonSearch('sessions', 'sessions', 'targets');
    await visit(urls.sessions);

    assert
      .dom(`[data-test-session-detail-link="${instances.session.id}"]`)
      .doesNotExist();
    assert
      .dom(`[data-test-session-id-copy="${instances.session.id}"]`)
      .isVisible();
  });

  test('cannot link to a terminated session', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.session.update({ status: STATUS_SESSION_TERMINATED });
    this.stubCacheDaemonSearch('sessions', 'sessions', 'targets');
    await visit(urls.sessions);
    assert
      .dom(`[data-test-session-detail-link="${instances.session.id}"]`)
      .doesNotExist();
    assert
      .dom(`[data-test-session-id-copy="${instances.session.id}"]`)
      .isVisible();
  });

  test('can cancel an active session with cancel permissions', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.projects);

    await click(`[href="${urls.sessions}"]`);

    assert
      .dom(`[data-test-session-cancel-button="${instances.session.id}"]`)
      .isVisible();
  });

  test('can cancel an active session with cancel:self permissions', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.session.update({ authorized_actions: ['cancel:self'] });
    this.stubCacheDaemonSearch('sessions', 'sessions', 'targets');
    await visit(urls.projects);

    await click(`[href="${urls.sessions}"]`);

    assert
      .dom(`[data-test-session-cancel-button="${instances.session.id}"]`)
      .isVisible();
  });

  test('cannot click cancel button without cancel permissions', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.session.update({ authorized_actions: [] });
    this.stubCacheDaemonSearch('sessions', 'sessions', 'targets');
    await visit(urls.sessions);

    assert
      .dom(`[data-test-session-cancel-button="${instances.session.id}"]`)
      .isNotVisible();
  });

  test('cancelling a session shows success alert', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.ipcStub.withArgs('stop');
    await visit(urls.projects);

    await click(`[href="${urls.sessions}"]`);
    await click('tbody tr:first-child td:last-child button');

    assert
      .dom('[data-test-toast-notification].hds-alert--color-success')
      .isVisible();
  });

  test('cancelling a session keeps you on the sessions list screen', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.ipcStub.withArgs('stop');
    await visit(urls.projects);

    await click(`[href="${urls.sessions}"]`);
    await click('tbody tr:first-child td:last-child button');

    assert.strictEqual(currentURL(), urls.sessions);
  });

  test('cancelling a session with error shows notification', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.server.post('/sessions/:id_method', () => new Response(400));
    await visit(urls.projects);

    await click(`[href="${urls.sessions}"]`);
    await click('tbody tr:first-child td:last-child button');

    assert
      .dom('[data-test-toast-notification].hds-alert--color-critical')
      .isVisible();
  });

  test('cancelling a session with ipc error shows notification', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.ipcStub.withArgs('stop').throws();
    await visit(urls.projects);

    await click(`[href="${urls.sessions}"]`);
    await click('tbody tr:first-child td:last-child button');

    assert
      .dom('[data-test-toast-notification].hds-alert--color-critical')
      .isVisible();
  });

  test('user can change org scope and only sessions for that org will be displayed', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.stubCacheDaemonSearch(
      'sessions',
      'sessions',
      'targets',
      'sessions',
      'targets',
      'aliases',
      'sessions',
      {
        resource: 'sessions',
        func: () => [instances.session2],
      },
      'targets',
    );
    await visit(urls.globalSessions);

    assert
      .dom(`[data-test-session-detail-link="${instances.session.id}"]`)
      .isVisible();
    assert
      .dom(`[data-test-session-detail-link="${instances.session2.id}"]`)
      .isVisible();

    // change scope in app header
    await click('.rose-header-nav .hds-dropdown-toggle-button');
    await click('.rose-header-nav .hds-dropdown-list-item:nth-of-type(4) a');
    // navigate to back sessions
    await click(`[href="${urls.sessions2}"]`);

    assert
      .dom(`[data-test-session-detail-link="${instances.session.id}"]`)
      .doesNotExist();
    assert
      .dom(`[data-test-session-detail-link="${instances.session2.id}"]`)
      .isVisible();
  });

  test('sessions list view still loads with no cache daemon', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.ipcStub.withArgs('isCacheDaemonRunning').returns(false);
    this.stubCacheDaemonSearch();
    const sessionsCount = this.server.schema.sessions.all().models.length;

    await visit(urls.globalSessions);

    assert.dom('.hds-segmented-group').doesNotExist();
    assert.strictEqual(currentURL(), urls.globalSessions);
    assert.dom('tbody tr').exists({ count: sessionsCount });
  });
});
