/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

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
    clusterUrl: '/cluster-url',
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

  test('visiting index', async function (assert) {
    assert.expect(2);
    const targetsCount = this.server.schema.targets.all().models.length;

    await visit(urls.targets);
    assert.strictEqual(currentURL(), urls.targets);
    assert.strictEqual(findAll('tbody tr').length, targetsCount);
  });

  test('visiting global scope', async function (assert) {
    assert.expect(1);
    await visit(urls.scopes.global);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.globalTargets);
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
    await visit(urls.scopes.global);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.globalTargets);
  });

  test('visiting org scope', async function (assert) {
    assert.expect(1);
    await visit(urls.scopes.org);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.targets);
  });

  test('can navigate among org scopes via header navigation', async function (assert) {
    assert.expect(3);
    await visit(urls.targets);

    await click('.rose-header-nav .rose-dropdown a:nth-of-type(2)');
    assert.strictEqual(currentURL(), urls.targets);
    await click('.rose-header-nav .rose-dropdown a:nth-of-type(3)');
    assert.strictEqual(currentURL(), urls.org2Targets);
    await click('.rose-header-nav .rose-dropdown a:nth-of-type(1)');
    assert.strictEqual(currentURL(), urls.globalTargets);
  });

  test('visiting index while unauthenticated redirects to global authenticate method', async function (assert) {
    invalidateSession();
    assert.expect(2);
    await visit(urls.targets);
    await a11yAudit();
    assert.notOk(currentSession().isAuthenticated);
    assert.strictEqual(currentURL(), urls.authenticate.methods.global);
  });

  test('visiting a target', async function (assert) {
    assert.expect(1);
    await visit(urls.targets);
    await click('tbody tr td span a');
    assert.strictEqual(currentURL(), urls.targetSessions);
  });

  test('visiting empty targets', async function (assert) {
    assert.expect(1);
    this.server.get('/targets', () => new Response(200));
    await visit(urls.targets);
    assert.ok(
      find('.rose-message-title').textContent.trim(),
      'No Targets Available'
    );
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
  });

  test('handles cli error on connect', async function (assert) {
    assert.expect(4);
    stubs.ipcService.withArgs('cliExists').returns(false);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;

    await visit(urls.scopes.global);
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
});
