/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  currentRouteName,
  click,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import WindowMockIPC from '../../../helpers/window-mock-ipc';
import {
  authenticateSession,
  invalidateSession,
  currentSession,
} from 'ember-simple-auth/test-support';
import setupStubs from 'api/test-support/handlers/client-daemon-search';

module('Acceptance | projects | targets | index', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupStubs(hooks);

  let getTargetCount;

  const APP_STATE_TITLE = '.hds-application-state__title';
  const TARGET_DETAILS_ROUTE_NAME =
    'scopes.scope.projects.targets.target.index';
  const ROSE_DIALOG_MODAL = '.rose-dialog-error';
  const CHOOSE_HOST_MODAL = '[data-test-host-modal]';
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
    target: null,
    session: null,
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
      address: '127.0.0.1',
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
    urls.authenticate.global = `${urls.scopes.global}/authenticate`;
    urls.authenticate.methods.global = `${urls.authenticate.global}/${instances.authMethods.global.id}`;
    urls.projects = `${urls.scopes.org}/projects`;
    urls.targets = `${urls.projects}/targets`;
    urls.target = `${urls.targets}/${instances.target.id}`;

    // Generate resource counter
    getTargetCount = () => this.server.schema.targets.all().models.length;

    // Mock the postMessage interface used by IPC.
    this.owner.register('service:browser/window', WindowMockIPC);
    setDefaultClusterUrl(this);

    this.ipcStub.withArgs('isClientDaemonRunning').returns(true);
    this.stubClientDaemonSearch('targets');
  });

  test('visiting index while unauthenticated redirects to global authenticate method', async function (assert) {
    invalidateSession();
    assert.expect(2);
    await visit(urls.targets);
    await a11yAudit();

    assert.notOk(currentSession().isAuthenticated);
    assert.strictEqual(currentURL(), urls.authenticate.methods.global);
  });

  test('visiting targets index', async function (assert) {
    assert.expect(2);
    const targetsCount = getTargetCount();
    await visit(urls.projects);

    await click(`[href="${urls.targets}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.targets);
    assert.strictEqual(getTargetCount(), targetsCount);
  });

  test('visiting a target', async function (assert) {
    assert.expect(2);
    await visit(urls.projects);

    await click(`[href="${urls.targets}"]`);

    assert.dom(`[data-test-visit-target="${instances.target.id}"]`).exists();

    await click(`[href="${urls.target}"]`);

    assert.strictEqual(currentURL(), urls.target);
  });

  test('visiting targets list view with no targets', async function (assert) {
    assert.expect(1);
    this.server.db.targets.remove();
    this.stubClientDaemonSearch('targets');

    await visit(urls.projects);

    await click(`[href="${urls.targets}"]`);

    assert.dom(APP_STATE_TITLE).hasText('No Targets Available');
  });

  test('user cannot navigate to a target without proper authorization', async function (assert) {
    assert.expect(1);
    instances.target.authorized_actions =
      instances.target.authorized_actions.filter((item) => item !== 'read');
    this.stubClientDaemonSearch('targets');

    await visit(urls.projects);

    await click(`[href="${urls.targets}"]`);

    assert
      .dom(`[data-test-visit-target="${instances.target.id}"]`)
      .doesNotExist();
  });

  test('user can connect to a target with proper authorization', async function (assert) {
    assert.expect(2);
    await visit(urls.projects);

    await click(`[href="${urls.targets}"]`);

    assert.true(
      instances.target.authorized_actions.includes('authorize-session'),
    );
    assert
      .dom(`[data-test-targets-connect-button="${instances.target.id}"]`)
      .exists();
  });

  test('user cannot connect to a target without proper authorization', async function (assert) {
    assert.expect(2);
    instances.target.authorized_actions =
      instances.target.authorized_actions.filter(
        (item) => item !== 'authorize-session',
      );
    this.stubClientDaemonSearch('targets');

    await visit(urls.projects);

    await click(`[href="${urls.targets}"]`);

    assert.false(
      instances.target.authorized_actions.includes('authorize-session'),
    );
    assert
      .dom(`[data-test-targets-connect-button="${instances.target.id}"]`)
      .doesNotExist();
  });

  test('user is redirected to target details page when unable to connect from list view if they have read and authorize-session permissions', async function (assert) {
    assert.expect(3);
    this.ipcStub.withArgs('cliExists').returns(true);
    this.ipcStub.withArgs('connect').rejects();
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;

    await visit(urls.targets);

    await click(`[data-test-targets-connect-button="${instances.target.id}"]`);

    assert.dom(ROSE_DIALOG_MODAL).exists();
    assert.dom(CHOOSE_HOST_MODAL).doesNotExist();
    assert.strictEqual(currentRouteName(), TARGET_DETAILS_ROUTE_NAME);
  });

  test('user can connect without target read permissions', async function (assert) {
    assert.expect(2);
    instances.target.authorized_actions =
      instances.target.authorized_actions.filter((item) => item !== 'read');
    this.stubClientDaemonSearch('targets');
    this.ipcStub.withArgs('cliExists').returns(true);
    this.ipcStub.withArgs('connect').returns({
      session_id: instances.session.id,
      address: 'a_123',
      port: 'p_123',
      protocol: 'tcp',
    });

    await visit(urls.targets);

    await click(`[data-test-targets-connect-button="${instances.target.id}"]`);

    assert.strictEqual(
      currentURL(),
      `${urls.projects}/sessions/${instances.session.id}`,
    );
    assert.dom(APP_STATE_TITLE).hasText('Connected');
  });

  test('user can retry connect without target read permissions', async function (assert) {
    assert.expect(5);
    instances.target.authorized_actions =
      instances.target.authorized_actions.filter((item) => item !== 'read');
    this.ipcStub.withArgs('cliExists').returns(true);
    this.ipcStub.withArgs('connect').rejects();
    this.stubClientDaemonSearch('targets');
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;

    await visit(urls.targets);

    await click(`[data-test-targets-connect-button="${instances.target.id}"]`);

    assert.strictEqual(currentURL(), urls.targets);
    assert.dom(ROSE_DIALOG_MODAL).exists();
    assert.dom(ROSE_DIALOG_MODAL_BUTTONS).exists({ count: 2 });
    assert.dom(ROSE_DIALOG_RETRY_BUTTON).hasText('Retry');
    assert.dom(ROSE_DIALOG_CANCEL_BUTTON).hasText('Cancel');
  });
});
