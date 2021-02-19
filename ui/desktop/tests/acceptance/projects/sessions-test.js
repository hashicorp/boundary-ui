import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  //fillIn,
  click,
  find,
  findAll,
  //getRootElement
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
    projects: null,
    sessions: null,
  };

  const setDefaultOrigin = (test) => {
    const windowOrigin = window.location.origin;
    const origin = test.owner.lookup('service:origin');
    origin.rendererOrigin = windowOrigin;
  };

  hooks.beforeEach(function () {
    instances.user = this.server.create('user', { scope: instances.scopes.global });

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
      'withRandomHostSets'
    );
    instances.session = this.server.create('session',
      {
        scope: instances.scopes.project,
        target: instances.target,
        status: 'active',
        user: instances.user
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
    invalidateSession();
    assert.expect(2);
    await visit(urls.sessions);
    await a11yAudit();
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), urls.authenticate.methods.global);
  });

  test('visiting index', async function (assert) {
    assert.expect(2);
    const sessionsCount = this.server.schema.sessions.all().models.length;
    // This later/cancelTimers technique allows us to test a page with
    // active polling.  Normally an acceptance test waits for all runloop timers
    // to stop before returning from an awaited test, but polling means that
    // runloop timers exist indefinitely.  We thus schedule a cancelation before
    // proceeding with our tests.
    later(async () => {
      run.cancelTimers();
      // await a11yAudit();
      assert.equal(currentURL(), urls.sessions);
      assert.equal(findAll('tbody tr').length, sessionsCount);
    }, 750);
    await visit(urls.sessions);
  });

  test('visiting empty sessions', async function (assert) {
    assert.expect(1);
    this.server.get('/sessions', () => new Response(200));
    later(async () => {
      run.cancelTimers();
      assert.ok(find('.rose-message-title').textContent.trim(), 'No Sessions Available');
    }, 750);
    await visit(urls.sessions);
  });

  test('can identify active sessions', async function (assert) {
    assert.expect(1);
    later(async () => {
      run.cancelTimers();
      assert.ok(find('tbody tr:first-child th:first-child .session-status-active'));
    }, 750);
    await visit(urls.sessions);
  });

  test('cannot identify pending sessions', async function (assert) {
    assert.expect(1);
    instances.session.update({ status: 'pending' });
    later(async () => {
      run.cancelTimers();
      assert.notOk(find('tbody tr:first-child th:first-child .session-status-active'));
    }, 750);
    await visit(urls.sessions);
  });

  test('cannot identify terminated sessions', async function (assert) {
    assert.expect(1);
    instances.session.update({ status: 'terminated' });
    later(async () => {
      run.cancelTimers();
      assert.notOk(find('tbody tr:first-child th:first-child .session-status-active'));
    }, 750);
    await visit(urls.sessions);
  });

  test('cancelling a session', async function (assert) {
    assert.expect(1);
    later(async () => {
      run.cancelTimers();
      await click('tbody tr:first-child td:last-child button');
      assert.ok(find('[role="alert"].is-success'));
    }, 750);
    await visit(urls.sessions);
  });

  test('cancelling a session with error shows notification', async function (assert) {
    assert.expect(1);
    this.server.post('/sessions/:id_method', () => new Response(400));
    later(async () => {
      run.cancelTimers();
      await click('tbody tr:first-child td:last-child button');
      assert.ok(find('[role="alert"].is-error'));
    }, 750);
    await visit(urls.sessions);
  });
});
