/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, find, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  currentSession,
  authenticateSession,
  invalidateSession,
} from 'ember-simple-auth/test-support';
import sinon from 'sinon';

module('Acceptance | projects | sessions', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let mockIPC;
  let messageHandler;

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
    index: '/',
    clusterUrl: '/cluster-url',
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
      'withAssociations'
    );
    instances.session = this.server.create(
      'session',
      {
        scope: instances.scopes.project,
        target: instances.target,
        status: 'active',
        user: instances.user,
      },
      'withAssociations'
    );

    urls.scopes.global = `/scopes/${instances.scopes.global.id}`;
    urls.scopes.org = `/scopes/${instances.scopes.org.id}`;
    urls.authenticate.global = `${urls.scopes.global}/authenticate`;
    urls.authenticate.methods.global = `${urls.authenticate.global}/${instances.authMethods.global.id}`;
    urls.projects = `${urls.scopes.org}/projects`;
    urls.sessions = `${urls.projects}/sessions`;

    class MockIPC {
      clusterUrl = null;

      invoke(method, payload) {
        return this[method](payload);
      }

      getClusterUrl() {
        return this.clusterUrl;
      }

      setClusterUrl(clusterUrl) {
        this.clusterUrl = clusterUrl;
        return this.clusterUrl;
      }
    }

    mockIPC = new MockIPC();
    messageHandler = async function (event) {
      if (event.origin !== window.location.origin) return;
      const { method, payload } = event.data;
      if (method) {
        const response = await mockIPC.invoke(method, payload);
        event.ports[0].postMessage(response);
      }
    };

    window.addEventListener('message', messageHandler);
    setDefaultClusterUrl(this);

    const ipcService = this.owner.lookup('service:ipc');
    stubs.ipcService = sinon.stub(ipcService, 'invoke');
  });

  hooks.afterEach(function () {
    window.removeEventListener('message', messageHandler);
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
    assert.strictEqual(findAll('tbody tr').length, sessionsCount);
  });

  test('visiting empty sessions', async function (assert) {
    assert.expect(1);
    this.server.get('/sessions', () => new Response(200));
    await visit(urls.sessions);
    await a11yAudit();
    assert.ok(
      find('.rose-message-title').textContent.trim(),
      'No Sessions Available'
    );
  });

  test('visiting sessions without targets is OK', async function (assert) {
    assert.expect(2);
    instances.session.update({ targetId: undefined });
    const sessionsCount = this.server.schema.sessions.all().models.length;
    await visit(urls.sessions);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.sessions);
    assert.strictEqual(findAll('tbody tr').length, sessionsCount);
  });

  test('can identify active sessions', async function (assert) {
    assert.expect(1);
    await visit(urls.sessions);
    assert.ok(
      find('tbody tr:first-child th:first-child .session-status-active')
    );
  });

  test('cannot identify pending sessions', async function (assert) {
    assert.expect(1);
    instances.session.update({ status: 'pending' });
    await visit(urls.sessions);
    assert.notOk(
      find('tbody tr:first-child th:first-child .session-status-active')
    );
  });

  test('cannot identify terminated sessions', async function (assert) {
    assert.expect(1);
    instances.session.update({ status: 'terminated' });
    await visit(urls.sessions);
    assert.notOk(
      find('tbody tr:first-child th:first-child .session-status-active')
    );
  });

  test('cancelling a session', async function (assert) {
    assert.expect(1);
    stubs.ipcService.withArgs('stop');
    await visit(urls.sessions);
    await click('tbody tr:first-child td:last-child button');
    assert.ok(find('[role="alert"].is-success'));
  });

  test('cancelling a session with error shows notification', async function (assert) {
    assert.expect(1);
    this.server.post('/sessions/:id_method', () => new Response(400));
    await visit(urls.sessions);
    await click('tbody tr:first-child td:last-child button');
    assert.ok(find('[role="alert"].is-error'));
  });

  test('cancelling a session with ipc error shows notification', async function (assert) {
    assert.expect(1);
    stubs.ipcService.withArgs('stop').throws();
    await visit(urls.sessions);
    await click('tbody tr:first-child td:last-child button');
    assert.ok(find('[role="alert"].is-error'));
  });
});
