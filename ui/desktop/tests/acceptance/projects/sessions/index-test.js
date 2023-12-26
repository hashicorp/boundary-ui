/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import WindowMockIPC from '../../../helpers/window-mock-ipc';
import {
  currentSession,
  authenticateSession,
  invalidateSession,
} from 'ember-simple-auth/test-support';
import sinon from 'sinon';
import {
  STATUS_SESSION_ACTIVE,
  STATUS_SESSION_PENDING,
  STATUS_SESSION_CANCELING,
  STATUS_SESSION_TERMINATED,
} from 'api/models/session';
import Store from 'api/services/store';

module('Acceptance | projects | sessions', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    authMethods: {
      global: null,
    },
    user: null,
    session: null,
  };

  const stubs = {
    global: null,
    org: null,
    ipcService: null,
  };

  const urls = {
    scopes: {
      global: null,
      org: null,
    },
    authenticate: {
      global: null,
      methods: {
        global: null,
      },
    },
    projects: null,
    sessions: null,
    session: null,
  };

  const setDefaultClusterUrl = (test) => {
    const windowOrigin = window.location.origin;
    const clusterUrl = test.owner.lookup('service:clusterUrl');
    clusterUrl.rendererClusterUrl = windowOrigin;
  };

  hooks.beforeEach(function () {
    instances.user = this.server.create('user', {
      scope: instances.scopes.global,
    });

    authenticateSession({ user_id: instances.user.id });

    // create scopes
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    stubs.global = { id: 'global', type: 'global' };
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: stubs.global,
    });
    stubs.org = { id: instances.scopes.org.id, type: 'org' };
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: stubs.org,
    });
    stubs.project = { id: instances.scopes.project.id, type: 'project' };

    instances.authMethods.global = this.server.create('auth-method', {
      scope: instances.scopes.global,
    });
    instances.target = this.server.create(
      'target',
      { scope: instances.scopes.project },
      'withAssociations',
    );
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

    urls.scopes.global = `/scopes/${instances.scopes.global.id}`;
    urls.scopes.org = `/scopes/${instances.scopes.org.id}`;
    urls.authenticate.global = `${urls.scopes.global}/authenticate`;
    urls.authenticate.methods.global = `${urls.authenticate.global}/${instances.authMethods.global.id}`;
    urls.projects = `${urls.scopes.org}/projects`;
    urls.sessions = `${urls.projects}/sessions`;
    urls.session = `${urls.projects}/sessions/${instances.session.id}`;

    // Mock the postMessage interface used by IPC.
    this.owner.register('service:browser/window', WindowMockIPC);
    setDefaultClusterUrl(this);

    const ipcService = this.owner.lookup('service:ipc');
    stubs.ipcService = sinon.stub(ipcService, 'invoke');

    // Use the original store so we don't try and hit the client daemon
    this.owner.register('service:store', Store);
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  test('visiting index while unauthenticated redirects to global authenticate method', async function (assert) {
    invalidateSession();
    assert.expect(2);

    await visit(urls.sessions);
    await a11yAudit();

    assert.notOk(currentSession().isAuthenticated);
    assert.strictEqual(currentURL(), urls.authenticate.methods.global);
  });

  test('visiting index', async function (assert) {
    assert.expect(2);
    const sessionsCount = this.server.schema.sessions.all().models.length;

    await visit(urls.sessions);

    assert.strictEqual(currentURL(), urls.sessions);
    assert.dom('tbody tr').exists({ count: sessionsCount });
  });

  test('visiting empty sessions', async function (assert) {
    assert.expect(1);
    this.server.get('/sessions', () => new Response(200));

    await visit(urls.sessions);
    await click('button.rose-button-inline-link-action'); // clear all filters
    await a11yAudit();

    assert.dom('.rose-message-title').hasText('No Sessions Available');
  });

  test('visiting sessions without targets is OK', async function (assert) {
    assert.expect(2);
    instances.session.update({ targetId: undefined });
    const sessionsCount = this.server.schema.sessions.all().models.length;

    await visit(urls.sessions);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.sessions);
    assert.dom('tbody tr').exists({ count: sessionsCount });
  });

  test('visiting a session', async function (assert) {
    assert.expect(1);

    await visit(urls.sessions);
    await click('[data-test-session-detail-link]');

    assert.strictEqual(currentURL(), urls.session);
  });

  test('can link to an active session', async function (assert) {
    assert.expect(1);

    await visit(urls.sessions);

    assert
      .dom(
        'tbody tr:first-child td:first-child [data-test-session-detail-link]',
      )
      .isVisible();
  });

  test('can link to an active session with read:self permissions', async function (assert) {
    assert.expect(1);
    instances.session.update({ authorized_actions: ['read:self'] });

    await visit(urls.sessions);

    assert
      .dom(
        'tbody tr:first-child td:first-child [data-test-session-detail-link]',
      )
      .isVisible();
  });

  test('can link to a pending session', async function (assert) {
    assert.expect(1);
    instances.session.update({ status: STATUS_SESSION_PENDING });

    await visit(urls.sessions);

    assert
      .dom(
        'tbody tr:first-child td:first-child [data-test-session-detail-link]',
      )
      .isVisible();
  });

  test('can link to session even without read permissions', async function (assert) {
    assert.expect(1);
    instances.session.update({ authorized_actions: [] });

    await visit(urls.sessions);

    assert
      .dom(
        'tbody tr:first-child td:first-child [data-test-session-detail-link]',
      )
      .isVisible();
  });

  test('cannot link to a canceling session', async function (assert) {
    assert.expect(2);
    instances.session.update({ status: STATUS_SESSION_CANCELING });

    await visit(urls.sessions);

    assert
      .dom(
        'tbody tr:first-child td:first-child [data-test-session-detail-link]',
      )
      .doesNotExist();
    assert
      .dom('tbody tr:first-child td:first-child [data-test-session-id-copy]')
      .isVisible();
  });

  test('cannot link to a terminated session', async function (assert) {
    assert.expect(2);
    instances.session.update({ status: STATUS_SESSION_TERMINATED });

    await visit(urls.sessions);
    await click('button.rose-button-inline-link-action'); // clear all filters

    assert
      .dom(
        'tbody tr:first-child td:first-child [data-test-session-detail-link]',
      )
      .doesNotExist();
    assert
      .dom('tbody tr:first-child td:first-child [data-test-session-id-copy]')
      .isVisible();
  });

  test('can cancel an active session with cancel permissions', async function (assert) {
    assert.expect(1);

    await visit(urls.sessions);

    assert
      .dom('tbody tr:first-child [data-test-session-cancel-button]')
      .isVisible();
  });

  test('can cancel an active session with cancel:self permissions', async function (assert) {
    assert.expect(1);
    instances.session.update({ authorized_actions: ['cancel:self'] });

    await visit(urls.sessions);

    assert
      .dom('tbody tr:first-child [data-test-session-cancel-button]')
      .isVisible();
  });

  test('cannot click cancel button without cancel permissions', async function (assert) {
    assert.expect(1);
    instances.session.update({ authorized_actions: [] });

    await visit(urls.sessions);

    assert
      .dom('tbody tr:first-child [data-test-session-cancel-button]')
      .isNotVisible();
  });

  test('cancelling a session shows success alert', async function (assert) {
    assert.expect(1);
    stubs.ipcService.withArgs('stop');

    await visit(urls.sessions);
    await click('tbody tr:first-child td:last-child button');

    assert.dom('[role="alert"].is-success').isVisible();
  });

  test('cancelling a session keeps you on the sessions list screen', async function (assert) {
    assert.expect(1);
    stubs.ipcService.withArgs('stop');

    await visit(urls.sessions);
    await click('tbody tr:first-child td:last-child button');

    assert.strictEqual(currentURL(), urls.sessions);
  });

  test('cancelling a session with error shows notification', async function (assert) {
    assert.expect(1);
    this.server.post('/sessions/:id_method', () => new Response(400));

    await visit(urls.sessions);
    await click('tbody tr:first-child td:last-child button');

    assert.dom('[role="alert"].is-error').isVisible();
  });

  test('cancelling a session with ipc error shows notification', async function (assert) {
    assert.expect(1);
    stubs.ipcService.withArgs('stop').throws();

    await visit(urls.sessions);
    await click('tbody tr:first-child td:last-child button');

    assert.dom('[role="alert"].is-error').isVisible();
  });
});
