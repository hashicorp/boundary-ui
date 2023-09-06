/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, click, find, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import sinon from 'sinon';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { TYPE_TARGET_SSH } from 'api/models/target';

module('Acceptance | projects | targets | target', function (hooks) {
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
        address: 'localhost',
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

  test.skip('connecting to a target', async function (assert) {
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

  test.skip('displays the correct target type (TCP) in the success dialog body', async function (assert) {
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

  test.skip('displays the correct target type (SSH) in the success dialog body', async function (assert) {
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

  test('handles cli error on connect', async function (assert) {
    assert.expect(4);
    stubs.ipcService.withArgs('cliExists').returns(true);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;

    await visit(urls.target);
    await click('[data-test-target-detail-connect-button]');

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

    await visit(urls.target);
    await click('[data-test-target-detail-connect-button]');

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

    await visit(urls.target);
    await click('[data-test-target-detail-connect-button]');
    const firstErrorDialog = find('.rose-dialog');
    await click('.rose-dialog footer .rose-button-primary', 'Retry');
    const secondErrorDialog = find('.rose-dialog');

    assert.notEqual(secondErrorDialog.id, firstErrorDialog.id);
  });
});
