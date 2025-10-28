/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
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
import WindowMockIPC from '../../../helpers/window-mock-ipc';
import {
  authenticateSession,
  invalidateSession,
  currentSession,
} from 'ember-simple-auth/test-support';
import setupStubs from 'api/test-support/handlers/cache-daemon-search';
import { setRunOptions } from 'ember-a11y-testing/test-support';
import {
  STATUS_SESSION_ACTIVE,
  STATUS_SESSION_TERMINATED,
} from 'api/models/session';

module('Acceptance | projects | targets | index', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupStubs(hooks);

  let getTargetCount;

  const APP_STATE_TITLE = '.hds-application-state__title';
  const TARGET_DETAILS_ROUTE_NAME =
    'scopes.scope.projects.targets.target.index';
  const HDS_DIALOG_MODAL = '.hds-modal';
  const HDS_DIALOG_MODAL_BUTTONS = '.hds-modal__footer button';
  const HDS_DIALOG_RETRY_BUTTON =
    '.hds-modal__footer .hds-button--color-primary';
  const HDS_DIALOG_CANCEL_BUTTON =
    '.hds-modal__footer .hds-button--color-secondary';
  const SESSIONS_FLYOUT = '[data-test-targets-sessions-flyout]';
  const SESSIONS_FLYOUT_TITLE =
    '[data-test-targets-sessions-flyout] .hds-flyout__title';
  const SESSIONS_FLYOUT_CLOSE_BUTTON =
    '[data-test-targets-sessions-flyout] .hds-flyout__dismiss';

  const instances = {
    scopes: {
      global: null,
      org: null,
      org2: null,
      project: null,
      project2: null,
    },
    authMethods: {
      global: null,
    },
    target: null,
    target2: null,
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
    session: null,
  };

  const setDefaultClusterUrl = (test) => {
    const windowOrigin = window.location.origin;
    const clusterUrl = test.owner.lookup('service:clusterUrl');
    clusterUrl.rendererClusterUrl = windowOrigin;
  };

  hooks.beforeEach(async function () {
    await authenticateSession({ username: 'admin' });
    // bypass mirage config that expects recursive to be passed in as queryParam
    this.server.get('/targets', ({ targets }) => targets.all());

    // Generate scopes
    instances.scopes.global = this.server.create('scope', {
      id: 'global',
      name: 'Global',
    });
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
    instances.scopes.org2 = this.server.create('scope', {
      type: 'org',
      scope: globalScope,
    });
    const org2Scope = { id: instances.scopes.org.id, type: 'org' };
    instances.scopes.project2 = this.server.create('scope', {
      type: 'project',
      scope: org2Scope,
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
        target_id: instances.target.id,
      },
      'withAssociations',
    );
    instances.target2 = this.server.create('target', {
      scope: instances.scopes.project2,
      address: 'localhost',
    });
    instances.alias = this.server.create('alias', {
      scope: instances.scopes.global,
      destination_id: instances.target.id,
    });

    // Generate route URLs for resources
    urls.scopes.global = `/scopes/${instances.scopes.global.id}`;
    urls.scopes.org = `/scopes/${instances.scopes.org.id}`;
    urls.authenticate.global = `${urls.scopes.global}/authenticate`;
    urls.authenticate.methods.global = `${urls.authenticate.global}/${instances.authMethods.global.id}`;
    urls.projects = `${urls.scopes.org}/projects`;
    urls.targets = `${urls.projects}/targets`;
    urls.sessions = `${urls.projects}/sessions`;
    urls.target = `${urls.targets}/${instances.target.id}`;
    urls.session = `${urls.projects}/sessions/${instances.session.id}`;

    // Generate resource counter
    getTargetCount = () => this.server.schema.targets.all().models.length;

    // Mock the postMessage interface used by IPC.
    this.owner.register('service:browser/window', WindowMockIPC);
    setDefaultClusterUrl(this);

    this.ipcStub.withArgs('isCacheDaemonRunning').returns(true);
    this.stubCacheDaemonSearch('sessions', 'targets', 'aliases');
  });

  test('visiting index while unauthenticated redirects to global authenticate method', async function (assert) {
    await invalidateSession();
    this.stubCacheDaemonSearch();
    await visit(urls.targets);

    assert.notOk(currentSession().isAuthenticated);
    assert.strictEqual(currentURL(), urls.authenticate.methods.global);
  });

  test('visiting targets index', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const targetsCount = getTargetCount();
    await visit(urls.projects);

    await click(`[href="${urls.targets}"]`);

    assert.dom('.hds-segmented-group').exists();
    assert.strictEqual(currentURL(), urls.targets);
    assert.strictEqual(getTargetCount(), targetsCount);
  });

  test('visiting a target', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.projects);

    await click(`[href="${urls.targets}"]`);

    assert.dom(`[data-test-visit-target="${instances.target.id}"]`).exists();

    await click(`[href="${urls.target}"]`);

    assert.strictEqual(currentURL(), urls.target);
  });

  test('visiting targets list view with no targets', async function (assert) {
    this.server.schema.targets.all().destroy();
    this.server.schema.sessions.all().destroy();
    this.stubCacheDaemonSearch('sessions', 'targets', 'aliases');

    await visit(urls.projects);

    await click(`[href="${urls.targets}"]`);

    assert.dom(APP_STATE_TITLE).hasText('No Targets Available');
  });

  test('user cannot navigate to a target without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.target.authorized_actions =
      instances.target.authorized_actions.filter((item) => item !== 'read');
    this.stubCacheDaemonSearch('sessions', 'targets', 'aliases');

    await visit(urls.projects);

    await click(`[href="${urls.targets}"]`);

    assert
      .dom(`[data-test-visit-target="${instances.target.id}"]`)
      .doesNotExist();
  });

  test('user can connect to a target with proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

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
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.target.authorized_actions =
      instances.target.authorized_actions.filter(
        (item) => item !== 'authorize-session',
      );
    this.stubCacheDaemonSearch('sessions', 'targets', 'aliases');

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
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.ipcStub.withArgs('cliExists').returns(true);
    this.ipcStub.withArgs('connect').rejects();
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    await visit(urls.projects);

    await click(`[href="${urls.targets}"]`);

    await click(`[data-test-targets-connect-button="${instances.target.id}"]`);

    assert.dom(HDS_DIALOG_MODAL).isVisible();
    assert.strictEqual(currentRouteName(), TARGET_DETAILS_ROUTE_NAME);
  });

  test('user can connect without target read permissions', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.target.authorized_actions =
      instances.target.authorized_actions.filter((item) => item !== 'read');
    this.stubCacheDaemonSearch('sessions', 'targets', 'aliases');
    this.ipcStub.withArgs('cliExists').returns(true);
    this.ipcStub.withArgs('connect').returns({
      session_id: instances.session.id,
      address: 'a_123',
      port: 'p_123',
      protocol: 'tcp',
    });
    await visit(urls.projects);

    await click(`[href="${urls.targets}"]`);

    await click(`[data-test-targets-connect-button="${instances.target.id}"]`);

    assert.strictEqual(
      currentURL(),
      `${urls.projects}/sessions/${instances.session.id}`,
    );
    assert.dom(APP_STATE_TITLE).hasText('Connected');
  });

  test('user can retry connect without target read permissions', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.target.authorized_actions =
      instances.target.authorized_actions.filter((item) => item !== 'read');
    this.ipcStub.withArgs('cliExists').returns(true);
    this.ipcStub.withArgs('connect').rejects();
    this.stubCacheDaemonSearch('sessions', 'targets', 'aliases');
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    await visit(urls.projects);

    await click(`[href="${urls.targets}"]`);

    await click(`[data-test-targets-connect-button="${instances.target.id}"]`);

    assert.strictEqual(currentURL(), urls.targets);
    assert.dom(HDS_DIALOG_MODAL).isVisible();
    assert.dom(HDS_DIALOG_MODAL_BUTTONS).isVisible({ count: 2 });
    assert.dom(HDS_DIALOG_RETRY_BUTTON).hasText('Retry');
    assert.dom(HDS_DIALOG_CANCEL_BUTTON).hasText('Cancel');
  });

  test('user can open sessions flyout when target has active or pending sessions', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.projects);

    await click(`[href="${urls.targets}"]`);

    assert
      .dom(
        `[data-test-targets-sessions-flyout-button="${instances.target.id}"]`,
      )
      .exists();

    await click(
      `[data-test-targets-sessions-flyout-button="${instances.target.id}"]`,
    );

    assert.dom(SESSIONS_FLYOUT).exists();
    assert.dom(SESSIONS_FLYOUT_TITLE).includesText(`Active sessions for`);

    await click(SESSIONS_FLYOUT_CLOSE_BUTTON);

    assert.dom(SESSIONS_FLYOUT).doesNotExist();
  });

  test('user can cancel a session from inside target sessions flyout', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.stubCacheDaemonSearch(
      'sessions',
      'targets',
      'aliases',
      {
        resource: 'sessions',
        func: () => [],
      },
      'targets',
      'aliases',
    );
    await visit(urls.projects);

    await click(`[href="${urls.targets}"]`);
    await click(
      `[data-test-targets-sessions-flyout-button="${instances.target.id}"]`,
    );

    assert.dom(SESSIONS_FLYOUT).exists();
    assert
      .dom(`[data-test-session-flyout-cancel-button="${instances.session.id}"]`)
      .exists();

    await click(
      `[data-test-session-flyout-cancel-button="${instances.session.id}"]`,
    );

    assert.dom(SESSIONS_FLYOUT).doesNotExist();
    assert
      .dom(
        `[data-test-targets-sessions-flyout-button="${instances.target.id}"]`,
      )
      .doesNotExist();
    assert.strictEqual(currentURL(), urls.targets);
  });

  test('user cannot cancel a session from inside target sessions flyout without permissions', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.session.authorized_actions =
      instances.session.authorized_actions.filter((item) => item !== 'cancel');
    this.stubCacheDaemonSearch('sessions', 'targets', 'aliases');
    await visit(urls.projects);

    await click(`[href="${urls.targets}"]`);
    await click(
      `[data-test-targets-sessions-flyout-button="${instances.target.id}"]`,
    );

    assert.dom(SESSIONS_FLYOUT).exists();
    assert.strictEqual(currentURL(), urls.targets);
    assert
      .dom(`[data-test-session-flyout-cancel-button="${instances.target.id}"]`)
      .doesNotExist();
    assert
      .dom(`[data-test-targets-session-detail-link="${instances.session.id}"]`)
      .exists();
  });

  test('user can navigate to session details from sessions table in flyout', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.projects);

    await click(`[href="${urls.targets}"]`);
    await click(
      `[data-test-targets-sessions-flyout-button="${instances.target.id}"]`,
    );

    assert.dom(SESSIONS_FLYOUT).exists();

    await click(
      `[data-test-targets-session-detail-link="${instances.session.id}"]`,
    );

    assert.strictEqual(currentURL(), urls.session);
  });

  test('user can navigate to session details from sessions table in flyout without permissions', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.session.authorized_actions =
      instances.session.authorized_actions.filter((item) => item !== 'read');
    this.stubCacheDaemonSearch('sessions', 'targets', 'aliases');
    await visit(urls.projects);

    await click(`[href="${urls.targets}"]`);
    await click(
      `[data-test-targets-sessions-flyout-button="${instances.target.id}"]`,
    );

    assert.dom(SESSIONS_FLYOUT).exists();
    assert
      .dom(`[data-test-targets-session-detail-link="${instances.session.id}"]`)
      .exists();

    await click(
      `[data-test-targets-session-detail-link="${instances.session.id}"]`,
    );

    assert.strictEqual(currentURL(), urls.session);
  });

  test('user can change org scope and only targets for that org will be displayed', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.stubCacheDaemonSearch(
      'sessions',
      'targets',
      'aliases',
      'sessions',
      {
        resource: 'targets',
        func: () => [instances.target],
      },
      'aliases',
    );

    await visit(urls.scopes.global);

    assert
      .dom(`[data-test-target-project-id="${instances.scopes.project.id}"]`)
      .exists();
    assert
      .dom(`[data-test-target-project-id="${instances.scopes.project2.id}"]`)
      .exists();

    await click('.rose-header-nav .hds-dropdown-toggle-button');
    await click('.rose-header-nav .hds-dropdown-list-item:nth-of-type(3) a');

    assert
      .dom(`[data-test-target-project-id="${instances.scopes.project.id}"]`)
      .exists();
    assert
      .dom(`[data-test-target-project-id="${instances.scopes.project2.id}"]`)
      .doesNotExist();
  });

  test('targets list view still loads with no cache daemon', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.ipcStub.withArgs('isCacheDaemonRunning').returns(false);
    this.stubCacheDaemonSearch();
    const targetsCount = getTargetCount();

    await visit(urls.projects);

    await click(`[href="${urls.targets}"]`);

    assert.dom('.hds-segmented-group').doesNotExist();
    assert.strictEqual(currentURL(), urls.targets);
    assert.dom('tbody tr').exists({ count: targetsCount });
  });

  test('target includes aliases', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.projects);
    await click(`[href="${urls.targets}"]`);

    assert.strictEqual(currentURL(), urls.targets);
    assert
      .dom(`[data-test-target-aliases="${instances.target.id}"]`)
      .hasText(instances.alias.value);
    assert
      .dom(`[data-test-target-aliases="${instances.target2.id}"]`)
      .hasNoText();
  });

  test('active sessions are refreshed when visiting the targets list page', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    this.stubCacheDaemonSearch(
      'sessions',
      'targets',
      'aliases',

      'sessions',
      'sessions',
      'targets',

      'sessions',
      'targets',
      'aliases',
    );

    const activeSessionFlyoutButtonSelector = (id) =>
      `[data-test-targets-sessions-flyout-button="${id}"]`;

    assert.strictEqual(instances.session.status, STATUS_SESSION_ACTIVE);
    await visit(urls.targets);
    const emberDataSessionModelBefore = this.owner
      .lookup('service:store')
      .peekRecord('session', instances.session.id);

    assert.strictEqual(
      emberDataSessionModelBefore.status,
      STATUS_SESSION_ACTIVE,
    );

    assert
      .dom(activeSessionFlyoutButtonSelector(instances.session.targetId))
      .exists();

    await click(`[href="${urls.sessions}"]`);

    assert
      .dom('.hds-table tbody tr:first-child')
      .includesText(instances.session.id);
    assert.dom('.hds-table tbody tr:first-child').includesText('Active');

    // simulate the session has been cancelled externally
    instances.session.status = STATUS_SESSION_TERMINATED;

    await click(`[href="${urls.targets}"]`);

    const emberDataSessionModelAfter = this.owner
      .lookup('service:store')
      .peekRecord('session', instances.session.id);
    assert.strictEqual(
      emberDataSessionModelAfter.status,
      STATUS_SESSION_TERMINATED,
    );
    assert
      .dom(activeSessionFlyoutButtonSelector(instances.session.targetId))
      .doesNotExist();
  });
});
