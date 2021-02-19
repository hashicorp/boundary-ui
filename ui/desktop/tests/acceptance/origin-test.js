import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  fillIn,
  click,
  //find,
  //findAll,
  //getRootElement
  //setupOnerror,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
//import { Response } from 'miragejs';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  //currentSession,
  //authenticateSession,
  invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | origin', function (hooks) {
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
      }
    },
    targets: null,
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
    urls.authenticate.org = `${urls.scopes.global}/authenticate/${instances.authMethods.org.id}`;
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
  });

  hooks.afterEach(function () {
    window.removeEventListener('message', messageHandler);
  });

  test('visiting index without an origin specified redirects to origin route', async function (assert) {
    assert.expect(2);
    await visit(urls.index);
    await a11yAudit();
    assert.notOk(mockIPC.origin);
    assert.equal(currentURL(), urls.origin);
  });

  test('can set origin', async function (assert) {
    assert.expect(2);
    assert.notOk(mockIPC.origin);
    await visit(urls.origin);
    await a11yAudit();
    await fillIn('[name="host"]', window.location.origin);
    await click('[type="submit"]');
    assert.equal(mockIPC.origin, window.location.origin);
  });

  test('can update origin', async function (assert) {
    assert.expect(2);
    await visit(urls.origin);
    await a11yAudit();
    await fillIn('[name="host"]', window.location.origin);
    await click('[type="submit"]');
    assert.equal(currentURL(), urls.authenticate.methods.global);
    await click('.change-origin a');
    assert.equal(currentURL(), urls.origin);
    await fillIn('[name="host"]', 'protocol://test');
    // FIXME: Submission raises mirage error
    // await click('[type="submit"]');
    // assert.equal(mockIPC.origin, 'protocol://test');
  });
});
