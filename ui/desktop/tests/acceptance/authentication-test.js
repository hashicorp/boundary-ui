import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  fillIn,
  click,
  find,
  //findAll,
  getRootElement,
  //setupOnerror,
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

module('Acceptance | authentication', function (hooks) {
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
      org: null,
    },
  };

  const stubs = {
    global: null,
    org: null,
  };

  const urls = {
    index: '/',
    origin: '/origin',
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

  const setDefaultOrigin = (test) => {
    const windowOrigin = window.location.origin;
    const origin = test.owner.lookup('service:origin');
    origin.rendererOrigin = windowOrigin;
  };

  hooks.beforeEach(function () {
    invalidateSession();

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
    instances.authMethods.global = this.server.create('auth-method', {
      scope: instances.scopes.global,
      type: 'password',
    });
    instances.authMethods.org = this.server.create('auth-method', {
      scope: instances.scopes.org,
      type: 'password',
    });

    urls.scopes.global = `/scopes/${instances.scopes.global.id}`;
    urls.scopes.org = `/scopes/${instances.scopes.org.id}`;
    urls.authenticate.global = `${urls.scopes.global}/authenticate`;
    urls.authenticate.methods.global = `${urls.authenticate.global}/${instances.authMethods.global.id}`;
    urls.projects = `${urls.scopes.global}/projects`;
    urls.targets = `${urls.projects}/targets`;
    urls.sessions = `${urls.projects}/sessions`;

    // Mock the postMessage interface used by IPC.
    this.owner.register('service:browser/window', WindowMockIPC);
    setDefaultOrigin(this);
  });

  test('visiting index while unauthenticated redirects to global authenticate method', async function (assert) {
    assert.expect(2);
    await visit(urls.index);
    await a11yAudit();
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), urls.authenticate.methods.global);
  });

  test('visiting authenticate route when there no methods shows a message', async function (assert) {
    assert.expect(2);
    instances.authMethods.global.destroy();
    await visit(urls.authenticate.global);
    await a11yAudit();
    assert.equal(currentURL(), urls.authenticate.global);
    assert.ok(find('.rose-message'));
  });

  test('visiting authenticate route without origin redirects to origin index', async function (assert) {
    assert.expect(1);
    this.owner.lookup('service:origin').rendererOrigin = null;
    await visit(urls.authenticate.global);
    await a11yAudit();
    assert.equal(currentURL(), urls.origin);
  });

  test('visiting authenticate route when the scope cannot be loaded is allowed', async function (assert) {
    assert.expect(1);
    this.server.get('/scopes', () => {
      return new Response(404);
    });
    await visit(urls.authenticate.global);
    await a11yAudit();
    assert.equal(currentURL(), urls.authenticate.methods.global);
  });

  test('failed authentication shows a notification message', async function (assert) {
    assert.expect(3);
    await visit(urls.authenticate.methods.global);
    assert.notOk(currentSession().isAuthenticated);
    await fillIn('[name="identification"]', 'error');
    await click('[type="submit"]');
    assert.ok(find('.rose-notification.is-error'));
    assert.notOk(currentSession().isAuthenticated);
  });

  test('can reset origin before authentication', async function (assert) {
    assert.expect(1);
    await visit(urls.authenticate.methods.global);
    await click('.change-origin a');
    assert.equal(currentURL(), urls.origin);
  });

  test('deauthentication redirects to first global authenticate method', async function (assert) {
    assert.expect(3);
    await visit(urls.authenticate.methods.global);
    await fillIn('[name="identification"]', 'test');
    await fillIn('[name="password"]', 'test');
    await click('[type="submit"]');
    assert.ok(currentSession().isAuthenticated);
    await click('.rose-header-utilities .rose-dropdown summary');
    assert.equal(
      find(
        '.rose-header-utilities .rose-dropdown-content button'
      ).textContent.trim(),
      'Deauthenticate'
    );
    await click('.rose-header-utilities .rose-dropdown-content button');
    assert.notOk(currentSession().isAuthenticated);
  });

  test('401 responses result in deauthentication', async function (assert) {
    assert.expect(3);
    await visit(urls.authenticate.methods.global);
    await fillIn('[name="identification"]', 'test');
    await fillIn('[name="password"]', 'test');
    await click('[type="submit"]');
    assert.ok(
      currentSession().isAuthenticated,
      'Session begins authenticated, before encountering 401'
    );
    assert.ok(currentURL(), urls.targets);
    this.server.get('/sessions', () => new Response(401));
    await visit(urls.sessions);
    assert.notOk(
      currentSession().isAuthenticated,
      'Session is unauthenticated, after encountering 401'
    );
  });

  test('color theme is applied from session data', async function (assert) {
    assert.expect(12);
    authenticateSession({
      scope: {
        id: instances.scopes.global.id,
        type: instances.scopes.global.type,
      },
    });
    await visit(urls.scopes.org);
    // system default
    assert.notOk(currentSession().get('data.theme'));
    assert.notOk(getRootElement().classList.contains('rose-theme-light'));
    assert.notOk(getRootElement().classList.contains('rose-theme-dark'));
    // toggle light mode
    await click('[name="theme"][value="light"]');
    assert.equal(currentSession().get('data.theme'), 'light');
    assert.ok(getRootElement().classList.contains('rose-theme-light'));
    assert.notOk(getRootElement().classList.contains('rose-theme-dark'));
    // toggle dark mode
    await click('[name="theme"][value="dark"]');
    assert.equal(currentSession().get('data.theme'), 'dark');
    assert.notOk(getRootElement().classList.contains('rose-theme-light'));
    assert.ok(getRootElement().classList.contains('rose-theme-dark'));
    // toggle system default
    await click('[name="theme"][value=""]');
    assert.notOk(currentSession().get('data.theme'));
    assert.notOk(getRootElement().classList.contains('rose-theme-light'));
    assert.notOk(getRootElement().classList.contains('rose-theme-dark'));
  });
});
