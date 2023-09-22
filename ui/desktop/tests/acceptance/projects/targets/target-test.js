/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import sinon from 'sinon';
import { authenticateSession } from 'ember-simple-auth/test-support';
import WindowMockIPC from '../../../helpers/window-mock-ipc';

module('Acceptance | projects | targets | target', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

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
    emptyTarget: null,
    targetWithOneHost: null,
    targetWithTwoHosts: null,
  };

  const stubs = {
    global: null,
    org: null,
    ipcService: null,
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
    emptyTarget: null,
    targetWithOneHost: null,
    targetWithTwoHosts: null,
  };

  const setDefaultClusterUrl = (test) => {
    const windowOrigin = window.location.origin;
    const clusterUrl = test.owner.lookup('service:clusterUrl');
    clusterUrl.rendererClusterUrl = windowOrigin;
  };

  hooks.beforeEach(function () {
    authenticateSession();

    // Generate scopes
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

    // Generate resources
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
    instances.targetWithOneHost = this.server.create(
      'target',
      { scope: instances.scopes.project },
      'withOneHost'
    );
    instances.targetWithTwoHosts = this.server.create(
      'target',
      { scope: instances.scopes.project },
      'withTwoHosts'
    );
    instances.emptyTarget = this.server.create('target', {
      scope: instances.scopes.project,
    });
    instances.session = this.server.create(
      'session',
      {
        scope: instances.scopes.project,
        status: 'active',
      },
      'withAssociations'
    );

    // Generate route URLs for resources
    urls.scopes.global = `/scopes/${instances.scopes.global.id}`;
    urls.scopes.org = `/scopes/${instances.scopes.org.id}`;
    urls.projects = `${urls.scopes.org}/projects`;
    urls.targets = `${urls.projects}/targets`;
    urls.target = `${urls.targets}/${instances.target.id}`;
    urls.targetWithOneHost = `${urls.targets}/${instances.targetWithOneHost.id}`;
    urls.targetWithTwoHosts = `${urls.targets}/${instances.targetWithTwoHosts.id}`;
    urls.emptyTarget = `${urls.targets}/${instances.emptyTarget.id}`;

    // Mock the postMessage interface used by IPC.
    this.owner.register('service:browser/window', WindowMockIPC);
    setDefaultClusterUrl(this);

    const ipcService = this.owner.lookup('service:ipc');
    stubs.ipcService = sinon.stub(ipcService, 'invoke');
  });

  test('user can connect to a target with an address', async function (assert) {
    assert.expect(3);
    stubs.ipcService.withArgs('cliExists').returns(true);
    stubs.ipcService.withArgs('connect').returns({
      session_id: instances.session.id,
      address: 'a_123',
      port: 'p_123',
      protocol: 'tcp',
    });
    await visit(urls.targets);

    await click(`[href="${urls.target}"]`);

    assert.dom(TARGET_CONNECT_BUTTON).isEnabled();
    assert.dom(APP_STATE_TITLE).includesText('Connect for more info');

    await click(TARGET_CONNECT_BUTTON);

    assert.dom(APP_STATE_TITLE).hasText('Connected');
  });

  test('handles cli error on connect', async function (assert) {
    assert.expect(4);
    stubs.ipcService.withArgs('cliExists').returns(true);
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
    stubs.ipcService.withArgs('cliExists').returns(true);
    stubs.ipcService.withArgs('connect').rejects();
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
    stubs.ipcService.withArgs('cliExists').rejects();
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    await visit(urls.targets);

    await click(`[href="${urls.target}"]`);
    await click(TARGET_CONNECT_BUTTON);
    const firstErrorDialog = find(ROSE_DIALOG_MODAL);
    await click(ROSE_DIALOG_RETRY_BUTTON, 'Retry');
    const secondErrorDialog = find(ROSE_DIALOG_MODAL);

    assert.notEqual(secondErrorDialog.id, firstErrorDialog.id);
  });

  test('user can connect to a target with one host', async function (assert) {
    assert.expect(2);
    stubs.ipcService.withArgs('cliExists').returns(true);
    stubs.ipcService.withArgs('connect').returns({
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

  test('user can connect to a target with two hosts', async function (assert) {
    assert.expect(3);
    stubs.ipcService.withArgs('cliExists').returns(true);
    stubs.ipcService.withArgs('connect').returns({
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

  test('user cannot connect to a target without an address and no host sources', async function (assert) {
    assert.expect(2);
    await visit(urls.projects);

    await click(`[href="${urls.targets}"]`);
    await click(`[href="${urls.emptyTarget}"]`);

    assert.dom(TARGET_CONNECT_BUTTON).isDisabled();
    assert.dom(APP_STATE_TITLE).includesText('Cannot connect');
  });
});
