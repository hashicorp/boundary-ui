/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import WindowMockIPC from '../../../helpers/window-mock-ipc';
import setupStubs from 'api/test-support/handlers/cache-daemon-search';

module('Acceptance | projects | targets | target', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupStubs(hooks);

  const TARGET_CONNECT_BUTTON = '[data-test-target-detail-connect-button]';
  const TARGET_QUICK_CONNECT_BUTTON = '[data-test-host-quick-connect]';
  const TARGET_HOST_CONNECT_BUTTON = '[data-test-host-connect]';
  const APP_STATE_TITLE = '.hds-application-state__title';
  const ROSE_DIALOG_MODAL = '.rose-dialog-error';
  const ROSE_DIALOG_MODAL_BUTTONS = '.rose-dialog-footer button';
  const ROSE_DIALOG_RETRY_BUTTON = '.rose-dialog footer .rose-button-primary';
  const ROSE_DIALOG_CANCEL_BUTTON =
    '.rose-dialog footer .rose-button-secondary';

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    authMethods: {
      global: null,
    },
    session: null,
    target: null,
    targetWithOneHost: null,
    targetWithTwoHosts: null,
    alias: null,
  };

  const urls = {
    scopes: {
      global: null,
      org: null,
    },
    projects: null,
    sessions: null,
    targets: null,
    target: null,
    targetWithOneHost: null,
    targetWithTwoHosts: null,
  };

  const setDefaultClusterUrl = (test) => {
    const windowOrigin = window.location.origin;
    const clusterUrl = test.owner.lookup('service:clusterUrl');
    clusterUrl.rendererClusterUrl = windowOrigin;
  };

  hooks.beforeEach(async function () {
    await authenticateSession();
    // bypass mirage config that expects recursive to be passed in as queryParam
    this.server.get('/targets', ({ targets }) => targets.all());

    // Generate scopes
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    const globalScope = { id: 'global', type: 'global' };
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: globalScope,
    });
    const orgScope = { id: instances.scopes.org.id, type: 'org' };
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: orgScope,
    });

    // Generate resources
    instances.authMethods.global = this.server.create('auth-method', {
      scope: instances.scopes.global,
    });
    instances.hostCatalog = this.server.create(
      'host-catalog',
      { scope: instances.scopes.project },
      'withChildren',
    );
    instances.target = this.server.create('target', {
      scope: instances.scopes.project,
      address: 'localhost',
    });

    instances.targetWithOneHost = this.server.create(
      'target',
      { scope: instances.scopes.project },
      'withOneHost',
    );
    instances.targetWithTwoHosts = this.server.create(
      'target',
      { scope: instances.scopes.project },
      'withTwoHosts',
    );
    instances.alias = this.server.create('alias', {
      scope: instances.scopes.global,
      destination_id: instances.targetWithOneHost.id,
    });
    instances.session = this.server.create(
      'session',
      {
        scope: instances.scopes.project,
        status: 'active',
      },
      'withAssociations',
    );

    // Generate route URLs for resources
    urls.scopes.global = `/scopes/${instances.scopes.global.id}`;
    urls.scopes.org = `/scopes/${instances.scopes.org.id}`;
    urls.projects = `${urls.scopes.org}/projects`;
    urls.targets = `${urls.projects}/targets`;
    urls.target = `${urls.targets}/${instances.target.id}`;
    urls.targetWithOneHost = `${urls.targets}/${instances.targetWithOneHost.id}`;
    urls.targetWithTwoHosts = `${urls.targets}/${instances.targetWithTwoHosts.id}`;

    // Mock the postMessage interface used by IPC.
    this.owner.register('service:browser/window', WindowMockIPC);
    setDefaultClusterUrl(this);

    this.ipcStub.withArgs('isCacheDaemonRunning').returns(true);
    this.stubCacheDaemonSearch('sessions', 'targets', 'aliases');
  });

  test('user can connect to a target with an address', async function (assert) {
    assert.expect(3);
    this.ipcStub.withArgs('cliExists').returns(true);
    this.ipcStub.withArgs('connect').returns({
      session_id: instances.session.id,
      address: 'localhost',
      port: 'p_123',
      protocol: 'tcp',
    });
    this.stubCacheDaemonSearch();

    await visit(urls.target);

    assert.dom(TARGET_CONNECT_BUTTON).isEnabled();
    assert.dom(APP_STATE_TITLE).includesText('Connect for more info');

    await click(TARGET_CONNECT_BUTTON);

    assert.dom(APP_STATE_TITLE).hasText('Connected');
  });

  test('handles cli error on connect', async function (assert) {
    assert.expect(4);
    this.ipcStub.withArgs('cliExists').returns(true);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    await visit(urls.targets);

    await click(`[href="${urls.target}"]`);
    await click(TARGET_CONNECT_BUTTON);

    assert.dom(ROSE_DIALOG_MODAL).exists();
    assert.dom(ROSE_DIALOG_MODAL_BUTTONS).exists({ count: 2 });
    assert.dom(ROSE_DIALOG_RETRY_BUTTON).hasText('Retry');
    assert.dom(ROSE_DIALOG_CANCEL_BUTTON).hasText('Cancel');
  });

  test('handles connect error', async function (assert) {
    assert.expect(4);
    this.ipcStub.withArgs('cliExists').returns(true);
    this.ipcStub.withArgs('connect').rejects();
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    await visit(urls.targets);

    await click(`[href="${urls.target}"]`);
    await click(TARGET_CONNECT_BUTTON);

    assert.dom(ROSE_DIALOG_MODAL).exists();
    assert.dom(ROSE_DIALOG_MODAL_BUTTONS).exists({ count: 2 });
    assert.dom(ROSE_DIALOG_RETRY_BUTTON).hasText('Retry');
    assert.dom(ROSE_DIALOG_CANCEL_BUTTON).hasText('Cancel');
  });

  test('user can retry on error', async function (assert) {
    assert.expect(1);
    this.ipcStub.withArgs('cliExists').rejects();
    this.stubCacheDaemonSearch();
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;

    await visit(urls.target);

    await click(TARGET_CONNECT_BUTTON);
    const firstErrorDialog = find(ROSE_DIALOG_MODAL);
    await click(ROSE_DIALOG_RETRY_BUTTON, 'Retry');
    const secondErrorDialog = find(ROSE_DIALOG_MODAL);

    assert.notEqual(secondErrorDialog.id, firstErrorDialog.id);
  });

  test('user can connect to a target with one host', async function (assert) {
    assert.expect(2);
    this.ipcStub.withArgs('cliExists').returns(true);
    this.ipcStub.withArgs('connect').returns({
      session_id: instances.session.id,
      address: 'a_123',
      port: 'p_123',
      protocol: 'tcp',
    });
    await visit(urls.targets);

    await click(`[href="${urls.targetWithOneHost}"]`);

    assert.dom(APP_STATE_TITLE).hasText('Connect for more info');

    await click(TARGET_CONNECT_BUTTON);

    assert.dom(APP_STATE_TITLE).hasText('Connected');
  });

  test('user can connect to a target with two hosts using host modal', async function (assert) {
    assert.expect(3);
    this.ipcStub.withArgs('cliExists').returns(true);
    this.ipcStub.withArgs('connect').returns({
      session_id: instances.session.id,
      address: 'a_123',
      port: 'p_123',
      protocol: 'tcp',
    });
    await visit(urls.targets);

    await click(`[href="${urls.targetWithTwoHosts}"]`);

    assert.dom(APP_STATE_TITLE).hasText('Connect for more info');

    await click(TARGET_CONNECT_BUTTON);

    assert.dom(TARGET_HOST_CONNECT_BUTTON).exists({ count: 2 });

    await click(TARGET_QUICK_CONNECT_BUTTON);

    assert.dom(APP_STATE_TITLE).hasText('Connected');
  });

  test('user can visit target details screen without read permissions for host-set', async function (assert) {
    assert.expect(1);
    this.server.get('/host-sets/:id', () => new Response(403));

    await visit(urls.targets);

    await click(`[href="${urls.targetWithOneHost}"]`);

    assert.strictEqual(currentURL(), urls.targetWithOneHost);
  });

  test('user can visit target details screen without read permissions for host', async function (assert) {
    assert.expect(1);
    this.server.get('/hosts/:id', () => new Response(403));

    await visit(urls.targets);

    await click(`[href="${urls.targetWithOneHost}"]`);

    assert.strictEqual(currentURL(), urls.targetWithOneHost);
  });

  test('user can visit target details and should not see the associated aliases if there are none', async function (assert) {
    await visit(urls.targets);

    await click(`[href="${urls.targetWithOneHost}"]`);

    assert.strictEqual(currentURL(), urls.targetWithOneHost);
    assert.dom('.aliases').doesNotExist();
  });

  test('user can visit target details and see the associated aliases', async function (assert) {
    await visit(urls.targets);
    instances.targetWithOneHost.update({
      aliases: [{ id: instances.alias.id, value: instances.alias.value }],
    });
    await click(`[href="${urls.targetWithOneHost}"]`);

    assert.strictEqual(currentURL(), urls.targetWithOneHost);
    assert.dom('.aliases').exists();
  });
  test('user can connect to a target without read permissions for host-set', async function (assert) {
    assert.expect(1);
    this.server.get('/host-sets/:id', () => new Response(403));
    this.ipcStub.withArgs('cliExists').returns(true);
    this.ipcStub.withArgs('connect').returns({
      session_id: instances.session.id,
      address: 'a_123',
      port: 'p_123',
      protocol: 'tcp',
    });

    await visit(urls.targets);

    await click(`[href="${urls.targetWithOneHost}"]`);
    await click(TARGET_CONNECT_BUTTON);

    assert.dom(APP_STATE_TITLE).hasText('Connected');
  });

  test('user can connect to a target without read permissions for host', async function (assert) {
    assert.expect(1);
    this.server.get('/hosts/:id', () => new Response(403));
    this.ipcStub.withArgs('cliExists').returns(true);
    this.ipcStub.withArgs('connect').returns({
      session_id: instances.session.id,
      address: 'a_123',
      port: 'p_123',
      protocol: 'tcp',
    });

    await visit(urls.targets);

    await click(`[href="${urls.targetWithOneHost}"]`);
    await click(TARGET_CONNECT_BUTTON);

    assert.dom(APP_STATE_TITLE).hasText('Connected');
  });
});
