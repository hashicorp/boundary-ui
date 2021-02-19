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
import { run, later } from '@ember/runloop';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  currentSession,
  authenticateSession,
  invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | authentication', function (hooks) {
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
      org: null,
    },
    hostCatalog: null,
    target: null,
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
    });
    instances.authMethods.org = this.server.create('auth-method', {
      scope: instances.scopes.org,
    });

    instances.hostCatalog = this.server.create(
      'host-catalog',
      { scope: instances.scopes.project },
      'withChildren'
    );
    instances.target = this.server.create(
      'target',
      { scope: instances.scopes.project },
      'withRandomHostSets'
    );

    urls.scopes.global = `/scopes/${instances.scopes.global.id}`;
    urls.scopes.org = `/scopes/${instances.scopes.org.id}`;
    urls.authenticate.global = `${urls.scopes.global}/authenticate`;
    urls.authenticate.methods.global = `${urls.authenticate.global}/${instances.authMethods.global.id}`;
    urls.projects = `${urls.scopes.org}/projects`;
    urls.targets = `${urls.projects}/targets`;

    class MockIPC {
      origin = null;

      invoke(method, payload) {
        return this[method](payload);
      }

      getOrigin() {
        return this.origin;
      }

      setOrigin(origin) {
        this.origin = origin;
        return this.origin;
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
    setDefaultOrigin(this);
  });

  hooks.afterEach(function () {
    window.removeEventListener('message', messageHandler);
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

//   test('successful authentication with the global scope redirects to targets', async function (assert) {
//     assert.expect(3);
//     await visit(urls.authenticate.methods.global);
//     assert.notOk(currentSession().isAuthenticated);
//     await fillIn('[name="identification"]', 'test');
//     await fillIn('[name="password"]', 'test');
//     await click('[type="submit"]');
//     assert.equal(currentURL(), urls.targets);
//     assert.ok(currentSession().isAuthenticated);
//   });
//
//   test('deauthentication redirects to first global authenticate method', async function (assert) {
//     assert.expect(4);
//     await visit(urls.authenticate.methods.global);
//     await fillIn('[name="identification"]', 'test');
//     await fillIn('[name="password"]', 'test');
//     await click('[type="submit"]');
//     assert.equal(currentURL(), urls.targets);
//     assert.ok(currentSession().isAuthenticated);
//     // Open header utilities dropdown
//     await click('.rose-header-utilities .rose-dropdown summary');
//     // Find and click on first element in dropdown - should be deauthenticate button
//     const menu = findAll(
//       '.rose-header-utilities .rose-dropdown .rose-dropdown-content button'
//     );
//     await click(menu[0]);
//     assert.notOk(currentSession().isAuthenticated);
//     assert.equal(currentURL(), urls.authenticate.methods.global);
//   });

  test('color theme is applied from session data', async function (assert) {
    assert.expect(12);
    authenticateSession({
      scope: {
        id: instances.scopes.global.id,
        type: instances.scopes.global.type,
      },
    });
    later(async () => {
      run.cancelTimers();
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
    }, 750);

    await visit(urls.scopes.org);
  });
});
