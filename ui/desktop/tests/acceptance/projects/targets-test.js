import { module, test } from 'qunit';
import { visit, currentURL, click, find, findAll } from '@ember/test-helpers';
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
import { TYPE_TARGET_SSH } from 'api/models/target';

module('Acceptance | projects | targets', function (hooks) {
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
    ipsService: null,
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
    projects: null,
    targets: null,
    target: null,
    sessions: null,
  };

  const setDefaultClusterUrl = (test) => {
    const windowOrigin = window.location.origin;
    const clusterUrl = test.owner.lookup('service:clusterUrl');
    clusterUrl.rendererClusterUrl = windowOrigin;
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
      {
        scope: instances.scopes.project,
      },
      'withAssociations'
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
    urls.authenticate.global = `${urls.scopes.global}/authenticate`;
    urls.authenticate.methods.global = `${urls.authenticate.global}/${instances.authMethods.global.id}`;
    urls.projects = `${urls.scopes.org}/projects`;
    urls.targets = `${urls.projects}/targets`;
    urls.target = `${urls.targets}/${instances.target.id}`;
    urls.sessions = `${urls.target}/sessions`;

    class MockIPC {
      clusterUrl = null;

      invoke(method, payload) {
        return this[method](payload);
      }

      getClusterUrl() {
        return this.clusterUrl;
      }

      setClusterUrl(clusterUrl) {
        this.clusterUrl = clusterUrl;
        return this.clusterUrl;
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
    setDefaultClusterUrl(this);

    const ipcService = this.owner.lookup('service:ipc');
    stubs.ipcService = sinon.stub(ipcService, 'invoke');
  });

  hooks.afterEach(function () {
    window.removeEventListener('message', messageHandler);
  });

  test('visiting index while unauthenticated redirects to global authenticate method', async function (assert) {
    invalidateSession();
    assert.expect(2);
    await visit(urls.targets);
    await a11yAudit();
    assert.notOk(currentSession().isAuthenticated);
    assert.strictEqual(currentURL(), urls.authenticate.methods.global);
  });

  test('visiting index', async function (assert) {
    assert.expect(2);
    const targetsCount = this.server.schema.targets.all().models.length;
    await visit(urls.targets);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.targets);
    assert.strictEqual(findAll('tbody tr').length, targetsCount);
  });

  test('visiting a target', async function (assert) {
    assert.expect(1);
    await visit(urls.targets);
    await click('tbody tr th a');
    assert.strictEqual(currentURL(), urls.sessions);
  });

  test('visiting empty targets', async function (assert) {
    assert.expect(1);
    this.server.get('/targets', () => new Response(200));
    await visit(urls.targets);
    assert.strictEqual(
      find('.rose-message-title').textContent.trim(),
      'No Targets Available'
    );
  });

  test('cannot navigate to a target without proper authorization', async function (assert) {
    assert.expect(1);
    instances.target.authorized_actions =
      instances.target.authorized_actions.filter((item) => item !== 'read');
    await visit(urls.targets);
    assert.notOk(find('main tbody .rose-table-header-cell:nth-child(1) a'));
  });

  test('connecting to a target', async function (assert) {
    assert.expect(4);
    stubs.ipcService.withArgs('cliExists').returns(true);
    stubs.ipcService.withArgs('connect').returns({
      session_id: instances.session.id,
      address: 'a_123',
      port: 'p_123',
      protocol: 'tcp',
    });
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    await visit(urls.targets);
    await click(
      'tbody tr:first-child td:last-child button',
      'Activate connect mode'
    );
    assert.ok(find('.dialog-detail'), 'Success dialog');
    assert.strictEqual(findAll('.rose-dialog-footer button').length, 1);
    assert.strictEqual(
      find('.rose-dialog-footer button').textContent.trim(),
      'Close',
      'Cannot retry'
    );
    assert.strictEqual(
      find('.rose-dialog-body .copyable-content').textContent.trim(),
      'a_123:p_123'
    );
  });

  test('displays the correct target type (TCP) in the success dialog body', async function (assert) {
    assert.expect(1);
    stubs.ipcService.withArgs('cliExists').returns(true);
    stubs.ipcService.withArgs('connect').returns({
      session_id: instances.session.id,
      address: 'a_123',
      port: 'p_123',
      protocol: 'tcp',
    });
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    await visit(urls.targets);
    await click(
      'tbody tr:first-child td:last-child button',
      'Activate connect mode'
    );

    assert.ok(find('.rose-dialog-body h3').textContent.trim().includes('TCP'));
  });

  test('displays the correct target type (SSH) in the success dialog body', async function (assert) {
    assert.expect(1);
    instances.target.update({
      type: TYPE_TARGET_SSH,
    });
    stubs.ipcService.withArgs('cliExists').returns(true);
    stubs.ipcService.withArgs('connect').returns({
      session_id: instances.session.id,
      address: 'a_123',
      port: 'p_123',
      protocol: 'ssh',
    });
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    await visit(urls.targets);
    await click(
      'tbody tr:first-child td:last-child button',
      'Activate connect mode'
    );

    assert.ok(find('.rose-dialog-body h3').textContent.trim().includes('SSH'));
  });

  // Skipping because this test doesn't make sense.  Users will never even see
  // targets for which they do not have authorize-session.  The only reason this
  // test ever passed was because filtering in target mocks wasn't previously
  // implemented.
  test.skip('cannot connect to a target without proper authorization', async function (assert) {
    assert.expect(3);
    instances.target.update({
      authorized_actions: instances.target.authorized_actions.filter(
        (action) => action != 'authorize-session'
      ),
    });
    assert.notOk(
      instances.target.authorized_actions.includes('authorize-session')
    );
    await visit(urls.targets);
    assert.ok(find('tbody tr:first-child'));
    assert.notOk(find('tbody tr:first-child td:last-child button'));
  });

  test('handles cli error on connect', async function (assert) {
    assert.expect(4);
    stubs.ipcService.withArgs('cliExists').returns(true);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    await visit(urls.targets);
    await click(
      'tbody tr:first-child td:last-child button',
      'Activate connect mode'
    );
    assert.ok(find('.rose-dialog-error'), 'Error dialog');
    const dialogButtons = findAll('.rose-dialog-footer button');
    assert.strictEqual(dialogButtons.length, 2);
    assert.strictEqual(
      dialogButtons[0].textContent.trim(),
      'Retry',
      'Can retry'
    );
    assert.strictEqual(
      dialogButtons[1].textContent.trim(),
      'Cancel',
      'Can cancel'
    );
  });

  test('handles connect error', async function (assert) {
    assert.expect(4);
    stubs.ipcService.withArgs('cliExists').returns(true);
    stubs.ipcService.withArgs('connect').rejects();
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    await visit(urls.targets);
    await click(
      'tbody tr:first-child td:last-child button',
      'Activate connect mode'
    );
    assert.ok(find('.rose-dialog-error'), 'Error dialog');
    const dialogButtons = findAll('.rose-dialog-footer button');
    assert.strictEqual(dialogButtons.length, 2);
    assert.strictEqual(
      dialogButtons[0].textContent.trim(),
      'Retry',
      'Can retry'
    );
    assert.strictEqual(
      dialogButtons[1].textContent.trim(),
      'Cancel',
      'Can cancel'
    );
  });

  test('can retry on error', async function (assert) {
    assert.expect(1);
    stubs.ipcService.withArgs('cliExists').rejects();
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    await visit(urls.targets);
    await click(
      'tbody tr:first-child td:last-child button',
      'Activate connect mode'
    );
    const firstErrorDialog = find('.rose-dialog');
    await click('.rose-dialog footer .rose-button-primary', 'Retry');
    const secondErrorDialog = find('.rose-dialog');
    assert.notEqual(secondErrorDialog.id, firstErrorDialog.id);
  });
});
