import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  //fillIn,
  click,
  find,
  //findAll,
  //getRootElement
  //setupOnerror,
} from '@ember/test-helpers';
import { run, later } from '@ember/runloop';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import sinon from 'sinon';
import {
  currentSession,
  authenticateSession,
  invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | scopes', function (hooks) {
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
    }
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
    globalProjects: null,
    targets: null,
    globalTargets: null,
  };

  const setDefaultOrigin = (test) => {
    const windowOrigin = window.location.origin;
    const origin = test.owner.lookup('service:origin');
    origin.rendererOrigin = windowOrigin;
  };

  hooks.beforeEach(function () {
    authenticateSession();

    // create scopes
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    stubs.global = { id: 'global', type: 'global' };
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: stubs.global,
    });
    instances.scopes.org2 = this.server.create('scope', {
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

    urls.scopes.global = `/scopes/${instances.scopes.global.id}`;
    urls.scopes.org = `/scopes/${instances.scopes.org.id}`;
    urls.authenticate.global = `${urls.scopes.global}/authenticate`;
    urls.authenticate.methods.global = `${urls.authenticate.global}/${instances.authMethods.global.id}`;
    urls.globalProjects = `${urls.scopes.global}/projects`;
    urls.projects = `${urls.scopes.org}/projects`;
    urls.globalTargets = `${urls.globalProjects}/targets`;
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

  test('visiting global scope', async function (assert) {
    assert.expect(1);
    later(async () => {
      run.cancelTimers();
      await a11yAudit();
      assert.equal(currentURL(), urls.globalTargets);
    }, 750);
    await visit(urls.scopes.global);
  });

  // TODO: this probably shouldn't be the case, but was setup to enable
  // authentication when the global scope couldn't be loaded.
  // In order to resolve this, we might hoist authentication routes up from
  // under scopes.
  test('visiting global scope is not successful when the global scope cannot be fetched', async function (assert) {
    assert.expect(1);
    this.server.get('/scopes/:id', ({ scopes }, { params: { id } }) => {
      const scope = scopes.find(id);
      const response = id === 'global' ? new Response(404) : scope;
      return response;
    });
    later(async () => {
      run.cancelTimers();
      await a11yAudit();
      assert.equal(currentURL(), urls.globalTargets);
    }, 750);
    await visit(urls.scopes.global);
  });

  test('visiting org scope', async function (assert) {
    assert.expect(1);
    later(async () => {
      run.cancelTimers();
      await a11yAudit();
      assert.equal(currentURL(), urls.targets);
    }, 750);
    await visit(urls.scopes.org);
  });

  test('can navigate among org scopes via header navigation', async function (assert) {
    assert.expect(2);
    later(async () => {
      run.cancelTimers();
      await a11yAudit();
      await click('.rose-header-nav .rose-dropdown a:nth-of-type(2)');
      assert.equal(currentURL(), urls.targets);
      await click('.rose-header-nav .rose-dropdown a:nth-of-type(1)');
      assert.equal(currentURL(), urls.globalTargets);
    }, 750);
    await visit(urls.scopes.global);
  });
});
