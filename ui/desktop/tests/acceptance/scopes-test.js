/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  click,
  find,
  findAll,
  waitFor,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  currentSession,
  authenticateSession,
  invalidateSession,
} from 'ember-simple-auth/test-support';
import WindowMockIPC from '../helpers/window-mock-ipc';
import setupStubs from 'api/test-support/handlers/client-daemon-search';

module('Acceptance | scopes', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupStubs(hooks);

  const APP_STATE_TITLE = '.hds-application-state__title';
  const META_DATA_RESPONSE = {
    builds: [
      { os: 'windows', url: 'windows.fake.download.zip' },
      { os: 'darwin', url: 'darwin.fake.download.dmg' },
      { os: 'linux', url: 'linux.fake.download.deb' },
    ],
  };

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

    // create scopes
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    const globalScope = { id: 'global', type: 'global' };
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: globalScope,
    });
    instances.scopes.org2 = this.server.create('scope', {
      type: 'org',
      scope: globalScope,
    });
    const orgScope = { id: instances.scopes.org.id, type: 'org' };
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: orgScope,
    });

    instances.authMethods.global = this.server.create('auth-method', {
      scope: instances.scopes.global,
    });

    instances.hostCatalog = this.server.create(
      'host-catalog',
      { scope: instances.scopes.project },
      'withChildren',
    );
    instances.target = this.server.create(
      'target',
      { scope: instances.scopes.project, address: 'localhost' },
      'withAssociations',
    );

    instances.session = this.server.create(
      'session',
      {
        scope: instances.scopes.project,
        status: 'active',
      },
      'withAssociations',
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

    this.owner.register('service:browser/window', WindowMockIPC);
    setDefaultClusterUrl(this);

    this.ipcStub.withArgs('isClientDaemonRunning').returns(true);
    this.stubClientDaemonSearch('targets', 'sessions', 'targets');
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
    this.stubClientDaemonSearch(
      'targets',
      'sessions',
      'targets',
      'sessions',
      'targets',
      'sessions',
      'targets',
      'sessions',
      'targets',
    );
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
    this.stubClientDaemonSearch();

    await visit(urls.targets);
    await a11yAudit();

    assert.notOk(currentSession().isAuthenticated);
    assert.strictEqual(currentURL(), urls.authenticate.methods.global);
  });

  test('visiting a target', async function (assert) {
    assert.expect(1);

    await visit(urls.targets);
    await click('[data-test-visit-target]');

    assert.strictEqual(currentURL(), urls.target);
  });

  test('visiting empty targets', async function (assert) {
    assert.expect(1);
    this.server.db.targets.remove();
    this.server.db.sessions.remove();
    this.stubClientDaemonSearch('targets', 'sessions', 'targets');

    await visit(urls.targets);

    assert.ok(find(APP_STATE_TITLE).textContent.trim(), 'No Targets Available');
  });

  test.skip('pagination is not supported - windows build', async function (assert) {
    this.ipcStub.withArgs('checkOS').returns({
      isWindows: true,
      isMac: false,
      isLinux: false,
    });
    this.server.get('https://api.releases.hashicorp.com/*', () => {
      return new Response(200, {}, META_DATA_RESPONSE);
    });
    this.server.get('/scopes', () => {
      // no "response_type" field
      return new Response(200, {}, { scopes: [] });
    });

    await visit(urls.targets);

    await waitFor('[data-test-unsupported-controller]');
    assert.dom('[data-test-unsupported-controller]').exists();
    assert
      .dom('[data-test-download-link]')
      .hasAttribute('href', 'windows.fake.download.zip');
  });

  test.skip('pagination is not supported - mac build', async function (assert) {
    this.ipcStub.withArgs('checkOS').returns({
      isWindows: false,
      isMac: true,
      isLinux: false,
    });
    this.server.get('/scopes', () => {
      // no "response_type" field
      return new Response(200, {}, { scopes: [] });
    });
    this.server.get('https://api.releases.hashicorp.com/*', () => {
      return new Response(200, {}, META_DATA_RESPONSE);
    });

    await visit(urls.targets);

    await waitFor('[data-test-unsupported-controller]');
    assert.dom('[data-test-unsupported-controller]').exists();
    assert
      .dom('[data-test-download-link]')
      .hasAttribute('href', 'darwin.fake.download.dmg');
  });

  test.skip('pagination is not supported - linux build', async function (assert) {
    this.ipcStub.withArgs('checkOS').returns({
      isWindows: false,
      isMac: false,
      isLinux: true,
    });
    this.server.get('/scopes', () => {
      // no "response_type" field
      return new Response(200, {}, { scopes: [] });
    });
    this.server.get('https://api.releases.hashicorp.com/*', () => {
      return new Response(200, {}, META_DATA_RESPONSE);
    });

    await visit(urls.targets);

    await waitFor('[data-test-unsupported-controller]');
    assert.dom('[data-test-unsupported-controller]').exists();
    assert
      .dom('[data-test-download-link]')
      .hasAttribute('href', 'linux.fake.download.deb');
  });

  test.skip('pagination is not supported - failed to fetch metaData', async function (assert) {
    this.ipcStub.withArgs('checkOS').returns({
      isWindows: true,
      isMac: false,
      isLinux: false,
    });
    this.server.get('/scopes', () => {
      // no "response_type" field
      return new Response(200, {}, { scopes: [] });
    });
    this.server.get('https://api.releases.hashicorp.com/*', () => {
      return new Response(500);
    });

    await visit(urls.targets);

    await waitFor('[data-test-unsupported-controller-alert]');
    assert.dom('[data-test-unsupported-controller-alert]').exists();
    assert
      .dom('[data-test-releases-link]')
      .hasAttribute('href', 'https://releases.hashicorp.com/boundary-desktop/');
  });

  test('pagination is not supported - navigate to cluster url page', async function (assert) {
    invalidateSession();
    this.stubClientDaemonSearch();
    this.ipcStub.withArgs('checkOS').returns({
      isWindows: true,
      isMac: false,
      isLinux: false,
    });
    this.server.get('/scopes', () => {
      // no "response_type" field
      return new Response(200, {}, { scopes: [] });
    });
    this.server.get('https://api.releases.hashicorp.com/*', () => {
      return new Response(200, {}, META_DATA_RESPONSE);
    });

    await visit(urls.targets);

    await waitFor('[data-test-unsupported-controller]');
    assert.dom('[data-test-unsupported-controller]').exists();
    assert
      .dom('[data-test-download-link]')
      .hasAttribute('href', 'windows.fake.download.zip');
    assert
      .dom('[data-test-change-cluster-url]')
      .hasAttribute('href', '/cluster-url');

    await click('[data-test-change-cluster-url]');

    assert.strictEqual(currentURL(), urls.clusterUrl);
  });
});
