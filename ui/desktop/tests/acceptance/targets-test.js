import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  //fillIn,
  //click,
  //find,
  //findAll,
  //getRootElement
  //setupOnerror,
} from '@ember/test-helpers';
import { run, later } from '@ember/runloop';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
// import { Response } from 'miragejs';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  currentSession,
  authenticateSession,
  invalidateSession,
} from 'ember-simple-auth/test-support';
import WindowMockIPC from '../helpers/window-mock-ipc';

module('Acceptance | targets', function (hooks) {
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
    target: null,
  };

  const stubs = {
    global: null,
    org: null,
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
    targets: null,
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
    stubs.org = { id: instances.scopes.org.id, type: 'org' };
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: stubs.org,
    });
    stubs.project = { id: instances.scopes.project.id, type: 'project' };

    instances.authMethods.global = this.server.create('auth-method', {
      scope: instances.scopes.global,
    });

    instances.hostCatalog = this.server.create(
      'host-catalog',
      { scope: instances.scopes.project },
      'withChildren'
    );
    instances.target = this.server.create(
      'target',
      { scope: instances.scopes.project },
      'withAssociations'
    );

    urls.scopes.global = `/scopes/${instances.scopes.global.id}`;
    urls.scopes.org = `/scopes/${instances.scopes.org.id}`;
    urls.authenticate.global = `${urls.scopes.global}/authenticate`;
    urls.authenticate.methods.global = `${urls.authenticate.global}/${instances.authMethods.global.id}`;
    urls.projects = `${urls.scopes.org}/projects`;
    urls.targets = `${urls.projects}/targets`;

    // Mock the postMessage interface used by IPC.
    this.owner.register('service:browser/window', WindowMockIPC);
    setDefaultOrigin(this);
  });

  test('visiting index while unauthenticated redirects to global authenticate method', async function (assert) {
    invalidateSession();
    assert.expect(2);
    await visit(urls.targets);
    await a11yAudit();
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), urls.authenticate.methods.global);
  });

  test('visiting index', async function (assert) {
    assert.expect(1);
    // This later/cancelTimers technique allows us to test a page with
    // active polling.  Normally an acceptance test waits for all runloop timers
    // to stop before returning from an awaited test, but polling means that
    // runloop timers exist indefinitely.  We thus schedule a cancellation before
    // proceeding with our tests.
    later(async () => {
      run.cancelTimers();
      await a11yAudit();
      assert.equal(currentURL(), urls.targets);
    }, 750);
    await visit(urls.targets);
  });
});
