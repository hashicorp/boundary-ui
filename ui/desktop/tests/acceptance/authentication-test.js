/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  fillIn,
  click,
  find,
  triggerEvent,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  currentSession,
  authenticateSession,
  invalidateSession,
} from 'ember-simple-auth/test-support';
import WindowMockIPC from '../helpers/window-mock-ipc';
import setupStubs from 'api/test-support/handlers/cache-daemon-search';

module('Acceptance | authentication', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupStubs(hooks);

  const SIGNOUT_BTN_SELECTOR = '[data-test-nav-signout-btn]';
  const CLOSE_SESSIONS_MODAL_SELECTOR = '[data-test-close-sessions-modal]';
  const CONFIRM_BUTTON = '.hds-modal__footer .hds-button--color-primary';
  const CANCEL_BUTTON = '.hds-modal__footer .hds-button--color-secondary';

  const instances = {
    scopes: {
      global: null,
      org: null,
      emptyOrg: null,
      project: null,
    },
    authMethods: {
      global: null,
      org: null,
    },
    user: null,
    target: null,
    session: null,
  };

  const stubs = {
    global: null,
    org: null,
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
    targets: null,
    sessions: null,
  };

  const setDefaultClusterUrl = (test) => {
    const windowOrigin = window.location.origin;
    const clusterUrl = test.owner.lookup('service:clusterUrl');
    clusterUrl.rendererClusterUrl = windowOrigin;
  };

  hooks.beforeEach(async function () {
    instances.user = this.server.create('user', {
      scope: instances.scopes.global,
    });

    await invalidateSession();

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

    // create other resources
    instances.scopes.emptyOrg = this.server.create('scope', {
      type: 'org',
      scope: stubs.global,
    });
    instances.authMethods.global = this.server.create('auth-method', {
      scope: instances.scopes.global,
      type: 'password',
    });
    instances.authMethods.org = this.server.create('auth-method', {
      scope: instances.scopes.org,
      type: 'password',
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
        status: 'active',
        user: instances.user,
      },
      'withAssociations',
    );

    urls.scopes.global = `/scopes/${instances.scopes.global.id}`;
    urls.scopes.org = `/scopes/${instances.scopes.org.id}`;
    urls.authenticate.global = `${urls.scopes.global}/authenticate`;
    urls.authenticate.methods.global = `${urls.authenticate.global}/${instances.authMethods.global.id}`;
    urls.projects = `${urls.scopes.global}/projects`;
    urls.targets = `${urls.projects}/targets`;
    urls.sessions = `${urls.projects}/sessions`;

    // Mock the postMessage interface used by IPC.
    this.owner.register('service:browser/window', WindowMockIPC);
    setDefaultClusterUrl(this);
  });

  test('visiting index while unauthenticated redirects to global authenticate method', async function (assert) {
    assert.expect(2);
    await visit(urls.index);
    await a11yAudit();
    assert.notOk(currentSession().isAuthenticated);
    assert.strictEqual(currentURL(), urls.authenticate.methods.global);
  });

  test('visiting authenticate route without clusterUrl redirects to clusterUrl index', async function (assert) {
    assert.expect(1);
    this.owner.lookup('service:clusterUrl').rendererClusterUrl = null;
    await visit(urls.authenticate.global);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.clusterUrl);
  });

  test('visiting authenticate route when the scope cannot be loaded is allowed', async function (assert) {
    assert.expect(1);
    this.server.get('/scopes/global', () => {
      return new Response(404);
    });
    await visit(urls.authenticate.global);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.authenticate.methods.global);
  });

  test('failed authentication shows a notification message', async function (assert) {
    assert.expect(3);
    await visit(urls.authenticate.methods.global);
    assert.notOk(currentSession().isAuthenticated);
    await fillIn('[name="identification"]', 'error');
    await click('[type="submit"]');
    assert
      .dom('[data-test-toast-notification].hds-alert--color-critical')
      .isVisible();
    assert.notOk(currentSession().isAuthenticated);
  });

  test('can reset clusterUrl before authentication', async function (assert) {
    assert.expect(1);
    await visit(urls.authenticate.methods.global);
    await click('.change-origin a');
    assert.strictEqual(currentURL(), urls.clusterUrl);
  });

  test('signing out redirects to first global authenticate method', async function (assert) {
    assert.expect(3);
    await visit(urls.authenticate.methods.global);

    await fillIn('[name="identification"]', 'test');
    await fillIn('[name="password"]', 'test');
    await click('[type="submit"]');

    assert.ok(currentSession().isAuthenticated);

    await click(
      '.rose-header-utilities .header-dropdown-button-override button',
    );

    assert.strictEqual(
      find(SIGNOUT_BTN_SELECTOR).textContent.trim(),
      'Sign Out',
    );

    await click(SIGNOUT_BTN_SELECTOR);

    assert.notOk(currentSession().isAuthenticated);
  });

  test('401 responses result in deauthentication', async function (assert) {
    assert.expect(3);
    await authenticateSession({
      scope: {
        id: instances.scopes.global.id,
        type: instances.scopes.global.type,
      },
    });
    await visit(urls.sessions);
    assert.ok(
      currentSession().isAuthenticated,
      'Session begins authenticated, before encountering 401',
    );
    assert.ok(currentURL(), urls.targets);
    this.server.get('/sessions', () => new Response(401));
    await visit(urls.targets);
    await visit(urls.sessions);
    assert.notOk(
      currentSession().isAuthenticated,
      'Session is unauthenticated, after encountering 401',
    );
  });

  test('org scopes with no auth methods are not visible in dropdown', async function (assert) {
    await visit(urls.authenticate.methods.global);

    await click('.hds-dropdown-toggle-button');

    assert.dom('.hds-dropdown-list-item button').exists({ count: 2 });
  });

  test('change cluster url is visible when no auth methods are available', async function (assert) {
    this.server.get('/auth-methods', () => new Response(200));
    await visit(urls.authenticate.methods.global);

    assert.dom('[data-test-no-auth-methods]').includesText('No Auth Methods');
    assert.dom('.change-origin').exists();
  });

  test('signing out with running sessions renders signout modal', async function (assert) {
    this.ipcStub.withArgs('hasRunningSessions').returns(true);

    await visit(urls.authenticate.methods.global);

    await fillIn('[name="identification"]', 'test');
    await fillIn('[name="password"]', 'test');
    await click('[type="submit"]');

    assert.ok(currentSession().isAuthenticated);

    await click(
      '.rose-header-utilities .header-dropdown-button-override button',
    );

    await click(SIGNOUT_BTN_SELECTOR);

    assert.dom(CLOSE_SESSIONS_MODAL_SELECTOR).isVisible();
    assert
      .dom(CLOSE_SESSIONS_MODAL_SELECTOR)
      .includesText('Sign out of Boundary?');

    await click(CANCEL_BUTTON);

    assert.dom(CLOSE_SESSIONS_MODAL_SELECTOR).isNotVisible();
    assert.ok(currentSession().isAuthenticated);
  });

  test('confirming signout via modal stops sessions and logs out user', async function (assert) {
    const stopAllSessions = this.ipcStub.withArgs('stopAll');
    this.ipcStub.withArgs('hasRunningSessions').returns(true);

    await visit(urls.authenticate.methods.global);

    await fillIn('[name="identification"]', 'test');
    await fillIn('[name="password"]', 'test');
    await click('[type="submit"]');

    assert.ok(currentSession().isAuthenticated);

    await click(
      '.rose-header-utilities .header-dropdown-button-override button',
    );

    await click(SIGNOUT_BTN_SELECTOR);

    assert.dom(CLOSE_SESSIONS_MODAL_SELECTOR).isVisible();
    assert
      .dom(CLOSE_SESSIONS_MODAL_SELECTOR)
      .includesText('Sign out of Boundary?');

    await click(CONFIRM_BUTTON);

    assert.dom(CLOSE_SESSIONS_MODAL_SELECTOR).isNotVisible();
    assert.ok(stopAllSessions.calledOnce);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('attempting to quit app when signout modal is present triggers the close sessions modal', async function (assert) {
    const quitApp = this.ipcStub.withArgs('closeWindow');
    const stopAllSessions = this.ipcStub.withArgs('stopAll');
    // onAppQuit() is the channel that handles when a user triggers the before-quit event in the electron app
    window.electron = {
      onAppQuit: (e) => {
        window.addEventListener('onAppQuit', e);
        return () => {
          window.removeEventListener('onAppQuit', e);
        };
      },
    };

    this.ipcStub.withArgs('hasRunningSessions').returns(true);

    await visit(urls.authenticate.methods.global);

    await fillIn('[name="identification"]', 'test');
    await fillIn('[name="password"]', 'test');
    await click('[type="submit"]');

    assert.ok(currentSession().isAuthenticated);

    await click(
      '.rose-header-utilities .header-dropdown-button-override button',
    );

    await click(SIGNOUT_BTN_SELECTOR);

    assert.dom(CLOSE_SESSIONS_MODAL_SELECTOR).isVisible();
    assert
      .dom(CLOSE_SESSIONS_MODAL_SELECTOR)
      .includesText('Sign out of Boundary?');

    await triggerEvent(window, 'onAppQuit');

    assert
      .dom(CLOSE_SESSIONS_MODAL_SELECTOR)
      .includesText('Close sessions before quitting?');

    await click(CONFIRM_BUTTON);
    assert.ok(stopAllSessions.calledOnce);
    assert.ok(quitApp.calledOnce);
  });
});
