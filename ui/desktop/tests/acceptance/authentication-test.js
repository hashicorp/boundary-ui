/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  fillIn,
  click,
  triggerEvent,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'desktop/tests/helpers';
import { Response } from 'miragejs';
import {
  currentSession,
  authenticateSession,
  invalidateSession,
} from 'ember-simple-auth/test-support';
import WindowMockIPC from '../helpers/window-mock-ipc';
import Service from '@ember/service';
import sinon from 'sinon';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | authentication', function (hooks) {
  setupApplicationTest(hooks);

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
    account: null,
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

  const SIGNOUT_BTN = '[data-test-nav-signout-btn]';
  const MODAL_CLOSE_SESSIONS = '[data-test-close-sessions-modal]';
  const MODAL_CONFIRM_BTN = '.hds-modal__footer .hds-button--color-primary';
  const MODAL_CANCEL_BTN = '.hds-modal__footer .hds-button--color-secondary';
  const HEADER_DROPDOWN_BTN = '.app-header__utility-actions button';

  const setDefaultClusterUrl = (test) => {
    const windowOrigin = window.location.origin;
    const clusterUrl = test.owner.lookup('service:clusterUrl');
    clusterUrl.rendererClusterUrl = windowOrigin;
  };

  hooks.beforeEach(async function () {
    await invalidateSession();

    const ipcService = this.owner.lookup('service:ipc');
    this.ipcStub = sinon.stub(ipcService, 'invoke');

    // create scopes
    instances.scopes.global = this.server.schema.scopes.find('global');
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
    instances.authMethods.global = this.server.schema.authMethods.first();
    instances.account = this.server.schema.accounts.first();
    instances.user = this.server.schema.users.first();
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

  hooks.afterEach(async function () {
    sinon.restore();
  });

  test('visiting index while unauthenticated redirects to global authenticate method', async function (assert) {
    assert.expect(2);
    await visit(urls.index);

    assert.notOk(currentSession().isAuthenticated);
    assert.strictEqual(currentURL(), urls.authenticate.methods.global);
  });

  test('visiting authenticate route without clusterUrl redirects to clusterUrl index', async function (assert) {
    assert.expect(1);
    this.owner.lookup('service:clusterUrl').rendererClusterUrl = null;
    await visit(urls.authenticate.global);

    assert.strictEqual(currentURL(), urls.clusterUrl);
  });

  test('visiting authenticate route when the scope cannot be loaded is allowed', async function (assert) {
    assert.expect(1);
    this.server.get('/scopes/global', () => {
      return new Response(404);
    });
    await visit(urls.authenticate.global);

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
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    assert.expect(3);
    await visit(urls.authenticate.methods.global);

    await fillIn('[name="identification"]', 'test');
    await fillIn('[name="password"]', 'test');
    await click('[type="submit"]');

    assert.ok(currentSession().isAuthenticated);

    await click(HEADER_DROPDOWN_BTN);

    assert.dom(SIGNOUT_BTN).includesText('Sign Out');

    await click(SIGNOUT_BTN);

    assert.notOk(currentSession().isAuthenticated);
  });

  test('401 responses result in deauthentication', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    assert.expect(3);
    await authenticateSession({
      account_id: instances.account.id,
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
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-19
          enabled: false,
        },
      },
    });

    this.ipcStub.withArgs('hasRunningSessions').returns(true);

    await visit(urls.authenticate.methods.global);

    await authenticateSession({ account_id: instances.account.id });

    assert.ok(currentSession().isAuthenticated);

    await click(HEADER_DROPDOWN_BTN);

    await click(SIGNOUT_BTN);

    assert.dom(MODAL_CLOSE_SESSIONS).isVisible();
    assert.dom(MODAL_CLOSE_SESSIONS).includesText('Sign out of Boundary?');

    await click(MODAL_CANCEL_BTN);

    assert.dom(MODAL_CLOSE_SESSIONS).isNotVisible();
    assert.ok(currentSession().isAuthenticated);
  });

  test('confirming signout via modal stops sessions and logs out user', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-19
          enabled: false,
        },
      },
    });

    const stopAllSessions = this.ipcStub.withArgs('stopAll');
    this.ipcStub.withArgs('hasRunningSessions').returns(true);

    await visit(urls.authenticate.methods.global);

    await authenticateSession({ account_id: instances.account.id });

    assert.ok(currentSession().isAuthenticated);

    await click(HEADER_DROPDOWN_BTN);

    await click(SIGNOUT_BTN);

    assert.dom(MODAL_CLOSE_SESSIONS).isVisible();
    assert.dom(MODAL_CLOSE_SESSIONS).includesText('Sign out of Boundary?');

    await click(MODAL_CONFIRM_BTN);

    assert.dom(MODAL_CLOSE_SESSIONS).isNotVisible();
    assert.ok(stopAllSessions.calledOnce);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('attempting to quit app when signout modal is present triggers the close sessions modal', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-19
          enabled: false,
        },
      },
    });

    // We need to encapsulate the event listener inside a mocked window service to ensure
    // the entire event is torn down (including the mocked window), since "window" exists
    // globally across all tests, and we don't want tests impacting one another
    const mockElectronEvent = class WindowElectronMock extends Service {
      electron = {
        onAppQuit: (callback) => {
          window.addEventListener('onAppQuit', callback);
          return () => {
            window.removeEventListener('onAppQuit', callback);
          };
        },
      };
    };

    this.owner.register('service:browser/window', mockElectronEvent);
    const stopAllSessions = this.ipcStub.withArgs('stopAll');
    const quitApp = this.ipcStub.withArgs('closeWindow');

    this.ipcStub.withArgs('hasRunningSessions').returns(true);

    await visit(urls.authenticate.methods.global);

    await authenticateSession({ account_id: instances.account.id });

    assert.ok(currentSession().isAuthenticated);

    await click(HEADER_DROPDOWN_BTN);

    await click(SIGNOUT_BTN);

    assert.dom(MODAL_CLOSE_SESSIONS).isVisible();
    assert.dom(MODAL_CLOSE_SESSIONS).includesText('Sign out of Boundary?');

    await triggerEvent(window, 'onAppQuit');

    assert
      .dom(MODAL_CLOSE_SESSIONS)
      .includesText('Close sessions before quitting?');

    await click(MODAL_CONFIRM_BTN);
    assert.ok(stopAllSessions.calledOnce);
    assert.ok(quitApp.calledOnce);
  });
});
