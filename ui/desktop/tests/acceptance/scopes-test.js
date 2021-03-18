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
    },
    target: null,
    session: null,
  };

  const stubs = {
    global: null,
    org: null,
    ipcService: null,
  };

  const urls = {
    index: '/',
    origin: '/origin',
    scopes: {
      global: null,
      org: null,
      org2: null,
    },
    authenticate: {
      global: null,
      methods: {
        global: null,
      },
    },
    projects: null,
    org2Projects: null,
    globalProjects: null,
    targets: null,
    org2Targets: null,
    globalTargets: null,
    target: null,
    targetSessions: null,
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

    instances.session = this.server.create(
      'session',
      {
        scope: instances.scopes.project,
        status: 'active',
      },
      'withAssociations'
    );

    urls.scopes.global = `/scopes/${instances.scopes.global.id}`;
    urls.scopes.org = `/scopes/${instances.scopes.org.id}`;
    urls.scopes.org2 = `/scopes/${instances.scopes.org2.id}`;
    urls.authenticate.global = `${urls.scopes.global}/authenticate`;
    urls.authenticate.methods.global = `${urls.authenticate.global}/${instances.authMethods.global.id}`;
    urls.projects = `${urls.scopes.org}/projects`;
    urls.org2Projects = `${urls.scopes.org2}/projects`;
    urls.globalProjects = `${urls.scopes.global}/projects`;
    urls.targets = `${urls.projects}/targets`;
    urls.org2Targets = `${urls.org2Projects}/targets`;
    urls.globalTargets = `${urls.globalProjects}/targets`;
    urls.target = `${urls.targets}/${instances.target.id}`;
    urls.targetSessions = `${urls.target}/sessions`;

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

    const ipcService = this.owner.lookup('service:ipc');
    stubs.ipcService = sinon.stub(ipcService, 'invoke');
  });

  hooks.afterEach(function () {
    window.removeEventListener('message', messageHandler);
  });

  test('visiting index', async function (assert) {
    assert.expect(2);
    const targetsCount = this.server.schema.targets.all().models.length;
    // This later/cancelTimers technique allows us to test a page with
    // active polling.  Normally an acceptance test waits for all runloop timers
    // to stop before returning from an awaited test, but polling means that
    // runloop timers exist indefinitely.  We thus schedule a cancelation before
    // proceeding with our tests.
    later(async () => {
      run.cancelTimers();
      await a11yAudit();
      assert.equal(currentURL(), urls.targets);
      assert.equal(findAll('tbody tr').length, targetsCount);
    }, 750);
    await visit(urls.targets);
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
    assert.expect(3);
    await later(async () => run.cancelTimers(), 750);
    await visit(urls.targets);
    await later(async () => assert.equal(currentURL(), urls.targets), 750);
    await click('.rose-header-nav .rose-dropdown a:nth-of-type(2)');
    await later(async () => assert.equal(currentURL(), urls.org2Targets), 750);
    await click('.rose-header-nav .rose-dropdown a:nth-of-type(3)');
    later(async () => assert.equal(currentURL(), urls.globalTargets), 750);
    await click('.rose-header-nav .rose-dropdown a:nth-of-type(1)');
  });

  test('visiting index while unauthenticated redirects to global authenticate method', async function (assert) {
    invalidateSession();
    assert.expect(2);
    await visit(urls.targets);
    await a11yAudit();
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), urls.authenticate.methods.global);
  });

  test('visiting a target', async function (assert) {
    assert.expect(1);
    later(async () => {
      run.cancelTimers();
      await click('tbody tr th a');
      assert.equal(currentURL(), urls.targetSessions);
    }, 750);
    await visit(urls.targets);
  });

  test('visiting empty targets', async function (assert) {
    assert.expect(1);
    this.server.get('/targets', () => new Response(200));
    later(async () => {
      run.cancelTimers();
      assert.ok(
        find('.rose-message-title').textContent.trim(),
        'No Targets Available'
      );
    }, 750);
    await visit(urls.targets);
  });

  test('connecting to a target', async function (assert) {
    assert.expect(3);
    stubs.ipcService.withArgs('cliExists').returns(true);
    stubs.ipcService.withArgs('connect').returns({
      session_id: instances.session.id,
      address: 'a_123',
      port: 'p_123',
      protocol: 'tcp',
    });
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;

    later(async () => {
      run.cancelTimers();
      await click(
        'tbody tr:first-child td:last-child button',
        'Activate connect mode'
      );
      assert.ok(find('.rose-dialog-success'), 'Success dialog');
      assert.equal(findAll('.rose-dialog-footer button').length, 1);
      assert.equal(
        find('.rose-dialog-footer button').textContent.trim(),
        'OK',
        'Cannot retry'
      );
    }, 750);
    await visit(urls.targets);
  });

  test('handles cli error on connect', async function (assert) {
    assert.expect(4);
    stubs.ipcService.withArgs('cliExists').returns(false);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;

    later(async () => {
      run.cancelTimers();
      await click(
        'tbody tr:first-child td:last-child button',
        'Activate connect mode'
      );
      assert.ok(find('.rose-dialog-error'), 'Error dialog');
      const dialogButtons = findAll('.rose-dialog-footer button');
      assert.equal(dialogButtons.length, 2);
      assert.equal(dialogButtons[0].textContent.trim(), 'Retry', 'Can retry');
      assert.equal(dialogButtons[1].textContent.trim(), 'Cancel', 'Can cancel');
    }, 750);
    await visit(urls.scopes.global);
  });

  test('handles connect error', async function (assert) {
    assert.expect(4);
    stubs.ipcService.withArgs('cliExists').returns(true);
    stubs.ipcService.withArgs('connect').rejects();
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;

    later(async () => {
      run.cancelTimers();
      await click(
        'tbody tr:first-child td:last-child button',
        'Activate connect mode'
      );
      assert.ok(find('.rose-dialog-error'), 'Error dialog');
      const dialogButtons = findAll('.rose-dialog-footer button');
      assert.equal(dialogButtons.length, 2);
      assert.equal(dialogButtons[0].textContent.trim(), 'Retry', 'Can retry');
      assert.equal(dialogButtons[1].textContent.trim(), 'Cancel', 'Can cancel');
    }, 750);
    await visit(urls.targets);
  });
});
