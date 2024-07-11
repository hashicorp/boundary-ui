/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

/* global QUnit */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import WindowMockIPC from '../../../helpers/window-mock-ipc';
import { STATUS_SESSION_ACTIVE } from 'api/models/session';
import setupStubs from 'api/test-support/handlers/cache-daemon-search';

module('Acceptance | projects | sessions | session', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupStubs(hooks);

  const TARGET_CONNECT_BUTTON = '[data-test-target-detail-connect-button]';

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

  const urls = {
    scopes: {
      global: null,
      org: null,
    },
    projects: null,
    targets: null,
    target: null,
    sessions: null,
    session: null,
  };

  const setDefaultClusterUrl = (test) => {
    const windowOrigin = window.location.origin;
    const clusterUrl = test.owner.lookup('service:clusterUrl');
    clusterUrl.rendererClusterUrl = windowOrigin;
  };

  let originalUncaughtException = QUnit.onUncaughtException;

  hooks.beforeEach(function () {
    instances.user = this.server.create('user', {
      scope: instances.scopes.global,
    });

    authenticateSession({ user_id: instances.user.id });

    // create scopes
    instances.scopes.global = this.server.create('scope', { id: 'global' });
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

    instances.hostCatalog = this.server.create('host-catalog', {
      scope: instances.scopes.project,
    });
    instances.host = this.server.create('host', {
      scope: instances.scopes.project,
      hostCatalog: instances.hostCatalog,
    });
    instances.authMethods.global = this.server.create('auth-method', {
      scope: instances.scopes.global,
    });
    instances.target = this.server.create(
      'target',
      { scope: instances.scopes.project, address: 'localhost' },
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
    urls.projects = `${urls.scopes.org}/projects`;
    urls.targets = `${urls.projects}/targets`;
    urls.target = `${urls.targets}/${instances.target.id}`;
    urls.sessions = `${urls.projects}/sessions`;
    urls.session = `${urls.projects}/sessions/${instances.session.id}`;

    // Mock the postMessage interface used by IPC.
    this.owner.register('service:browser/window', WindowMockIPC);
    setDefaultClusterUrl(this);

    this.ipcStub.withArgs('isCacheDaemonRunning').returns(false);
  });

  hooks.afterEach(function () {
    // reset onUncaughtException to original state
    QUnit.onUncaughtException = originalUncaughtException;
  });

  test('visiting session detail', async function (assert) {
    assert.expect(1);

    await visit(urls.session);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.session);
  });

  test('visiting session with no credentials', async function (assert) {
    assert.expect(4);
    this.ipcStub.withArgs('cliExists').returns(true);
    this.ipcStub.withArgs('connect').returns({
      session_id: instances.session.id,
      address: 'a_123',
      port: 'p_123',
      protocol: 'tcp',
    });

    await visit(urls.target);
    await click(TARGET_CONNECT_BUTTON);

    assert.strictEqual(currentURL(), urls.session);
    assert.dom('credential-panel-header').doesNotExist();
    assert.dom('credential-panel-body').doesNotExist();
    assert
      .dom('[data-test-no-credentials]')
      .hasText(`Connected You can now access ${instances.target.name}`);
  });

  test('visiting a session that does not have permissions to read a host', async function (assert) {
    assert.expect(1);
    this.server.get('/hosts/:id', () => new Response(403));
    this.ipcStub.withArgs('cliExists').returns(true);
    this.ipcStub.withArgs('connect').returns({
      session_id: instances.session.id,
      host_id: 'h_123',
      address: 'a_123',
      port: 'p_123',
      protocol: 'tcp',
    });

    await visit(urls.target);
    await click(TARGET_CONNECT_BUTTON);

    assert.strictEqual(currentURL(), urls.session);
  });

  test('visiting a session that does not have read permissions but a successful connect', async function (assert) {
    assert.expect(2);
    // verifies second call to sessions/:id is also a 403
    QUnit.onUncaughtException = (err) => {
      assert.true(err.errors[0].isForbidden);
    };

    this.server.get('/sessions/:id', () => new Response(403));
    this.ipcStub.withArgs('cliExists').returns(true);
    this.ipcStub.withArgs('connect').returns({
      session_id: instances.session.id,
      host_id: 'h_123',
      address: 'a_123',
      port: 'p_123',
      protocol: 'tcp',
      expiration: '2022-02-05T09:55:39.216Z',
    });

    await visit(urls.target);
    await click(TARGET_CONNECT_BUTTON);
    assert.strictEqual(currentURL(), urls.session);
  });

  test('can cancel a session with cancel:self permissions', async function (assert) {
    assert.expect(1);
    instances.session.update({ authorized_actions: ['cancel:self'] });

    await visit(urls.session);

    assert.dom('[data-test-session-detail-cancel-button]').isVisible();
  });

  test('cannot cancel a session without cancel permissions', async function (assert) {
    assert.expect(1);
    instances.session.update({ authorized_actions: [] });

    await visit(urls.session);

    assert.dom('[data-test-session-detail-cancel-button]').isNotVisible();
  });

  test('cancelling a session shows success alert', async function (assert) {
    assert.expect(1);

    await visit(urls.session);
    await click('[data-test-session-detail-cancel-button]');

    assert.dom('[role="alert"].is-success').isVisible();
  });

  test('cancelling a session takes you to the targets list screen', async function (assert) {
    assert.expect(1);

    await visit(urls.session);
    await click('[data-test-session-detail-cancel-button]');

    assert.strictEqual(currentURL(), urls.targets);
  });

  test('cancelling a session with error shows notification', async function (assert) {
    assert.expect(1);
    this.server.post('/sessions/:id_method', () => new Response(400));

    await visit(urls.session);
    await click('[data-test-session-detail-cancel-button]');

    assert.dom('[role="alert"].is-error').isVisible();
  });

  test('cancelling a session with ipc error shows notification', async function (assert) {
    assert.expect(1);
    this.ipcStub.withArgs('stop').throws();

    await visit(urls.session);
    await click('[data-test-session-detail-cancel-button]');

    assert.dom('[role="alert"].is-error').isVisible();
  });
});
