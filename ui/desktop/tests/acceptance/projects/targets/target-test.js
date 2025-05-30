/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  click,
  find,
  select,
  fillIn,
  waitFor,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import WindowMockIPC from '../../../helpers/window-mock-ipc';
import setupStubs from 'api/test-support/handlers/cache-daemon-search';

module('Acceptance | projects | targets | target', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupStubs(hooks);

  const TARGET_RESOURCE_LINK = (id) => `[data-test-visit-target="${id}"]`;
  const TARGET_TABLE_CONNECT_BUTTON = (id) =>
    `[data-test-targets-connect-button="${id}"]`;
  const TARGET_CONNECT_BUTTON = '[data-test-target-detail-connect-button]';
  const TARGET_HOST_SOURCE_CONNECT_BUTTON = (id) =>
    `[data-test-target-connect-button=${id}]`;
  const APP_STATE_TITLE = '.hds-application-state__title';
  const HDS_DIALOG_MODAL = '.hds-modal';
  const HDS_DIALOG_MODAL_BUTTONS = '.hds-modal__footer button';
  const HDS_DIALOG_RETRY_BUTTON =
    '.hds-modal__footer .hds-button--color-primary';
  const HDS_DIALOG_CANCEL_BUTTON =
    '.hds-modal__footer .hds-button--color-secondary';
  const TABLE_ROWS = 'tbody tr';
  const FIRST_ROW = 'tbody tr:first-child';
  const SECOND_ROW = 'tbody tr:nth-child(2)';
  const SEARCH_INPUT = 'input[type="search"]';
  const NO_RESULTS_MSG = '[data-test-no-host-source-results]';

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
    targetWithManyHosts: null,
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
    targetWithManyHosts: null,
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
    instances.targetWithManyHosts = this.server.create(
      'target',
      { scope: instances.scopes.project },
      'withManyHosts',
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
    urls.targetWithManyHosts = `${urls.targets}/${instances.targetWithManyHosts.id}`;

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

    assert.dom(HDS_DIALOG_MODAL).isVisible();
    assert.dom(HDS_DIALOG_MODAL_BUTTONS).isVisible({ count: 2 });
    assert.dom(HDS_DIALOG_RETRY_BUTTON).hasText('Retry');
    assert.dom(HDS_DIALOG_CANCEL_BUTTON).hasText('Cancel');
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

    assert.dom(HDS_DIALOG_MODAL).isVisible();
    assert.dom(HDS_DIALOG_MODAL_BUTTONS).isVisible({ count: 2 });
    assert.dom(HDS_DIALOG_RETRY_BUTTON).hasText('Retry');
    assert.dom(HDS_DIALOG_CANCEL_BUTTON).hasText('Cancel');
  });

  test('user can retry on error', async function (assert) {
    assert.expect(1);
    this.ipcStub.withArgs('cliExists').rejects();
    this.stubCacheDaemonSearch();
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;

    await visit(urls.target);

    await click(TARGET_CONNECT_BUTTON);
    const firstErrorDialog = find(HDS_DIALOG_MODAL);
    await click(HDS_DIALOG_RETRY_BUTTON, 'Retry');
    const secondErrorDialog = find(HDS_DIALOG_MODAL);

    assert.notEqual(
      secondErrorDialog.getAttribute('aria-labelledby'),
      firstErrorDialog.getAttribute('aria-labelledby'),
    );
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

  test('user can search for a host source by name, description, and address', async function (assert) {
    const host1 =
      instances.targetWithTwoHosts.hostSets.models[0].hosts.models[0];
    const host2 =
      instances.targetWithTwoHosts.hostSets.models[0].hosts.models[1];
    await visit(urls.targets);
    await click(`[href="${urls.targetWithTwoHosts}"]`);

    assert.dom(TABLE_ROWS).exists({ count: 2 });
    assert.dom(FIRST_ROW).includesText(host1.name);
    assert.dom(SECOND_ROW).includesText(host2.name);

    await fillIn(SEARCH_INPUT, host2.name);
    await waitFor(SECOND_ROW, { count: 0 });

    assert.dom(TABLE_ROWS).exists({ count: 1 });
    assert.dom(FIRST_ROW).includesText(host2.name);
    assert.dom(SECOND_ROW).doesNotExist();

    await fillIn(SEARCH_INPUT, '');
    await waitFor(TABLE_ROWS, { count: 2 });

    await fillIn(SEARCH_INPUT, host1.description);
    await waitFor(SECOND_ROW, { count: 0 });

    assert.dom(TABLE_ROWS).exists({ count: 1 });
    assert.dom(FIRST_ROW).includesText(host1.description);
    assert.dom(SECOND_ROW).doesNotExist();

    await fillIn(SEARCH_INPUT, '');
    await waitFor(TABLE_ROWS, { count: 2 });

    await fillIn(SEARCH_INPUT, host2.attributes.address);
    await waitFor(SECOND_ROW, { count: 0 });

    assert.dom(TABLE_ROWS).exists({ count: 1 });
    assert.dom(FIRST_ROW).includesText(host2.attributes.address);
    assert.dom(SECOND_ROW).doesNotExist();
  });

  test('user can search for host sources and get no results', async function (assert) {
    await visit(urls.targets);
    await click(`[href="${urls.targetWithTwoHosts}"]`);

    assert.dom(TABLE_ROWS).exists({ count: 2 });

    await fillIn(SEARCH_INPUT, 'non-existing-host');
    await waitFor(TABLE_ROWS, { count: 0 });

    assert.dom(NO_RESULTS_MSG).includesText('No results found');
  });

  test('user can see host source table when visiting a target via resource link', async function (assert) {
    const targetId = instances.targetWithTwoHosts.id;

    await visit(urls.targets);
    await click(TARGET_RESOURCE_LINK(targetId));

    assert.dom(TABLE_ROWS).exists({ count: 2 });
  });

  test('user can see host source table when visiting a target via connect button', async function (assert) {
    const targetId = instances.targetWithTwoHosts.id;

    await visit(urls.targets);
    await click(TARGET_TABLE_CONNECT_BUTTON(targetId));

    assert.dom(TABLE_ROWS).exists({ count: 2 });
  });

  test('user can connect to a target with two hosts using host source table', async function (assert) {
    const hostId =
      instances.targetWithTwoHosts.hostSets.models[0].hosts.models[0].id;

    assert.expect(2);
    this.ipcStub.withArgs('cliExists').returns(true);
    this.ipcStub.withArgs('connect').returns({
      session_id: instances.session.id,
      address: 'a_123',
      port: 'p_123',
      protocol: 'tcp',
    });
    await visit(urls.targets);

    await click(`[href="${urls.targetWithTwoHosts}"]`);

    assert.dom(TABLE_ROWS).exists({ count: 2 });

    await click(TARGET_HOST_SOURCE_CONNECT_BUTTON(hostId));

    assert.dom(APP_STATE_TITLE).hasText('Connected');
  });

  test.each(
    'user sees correct button text for a',
    {
      'target with address': { target: 'target', expectedText: 'Connect' },
      'target with one host': {
        target: 'targetWithOneHost',
        expectedText: 'Connect',
      },
      'target with two hosts': {
        target: 'targetWithTwoHosts',
        expectedText: 'Quick Connect',
      },
    },
    async function (assert, input) {
      await visit(urls.targets);

      await click(`[href="${urls[input.target]}"]`);

      assert.dom(TARGET_CONNECT_BUTTON).hasText(input.expectedText);
    },
  );

  test('user can use table pagination to see more hosts', async function (assert) {
    await visit(urls.targets);
    await click(`[href="${urls.targetWithManyHosts}"]`);

    assert.dom(TABLE_ROWS).exists({ count: 10 });
    assert.dom('[data-test-pagination]').isVisible();

    await click('button[aria-label="Next page"]');

    assert.dom(TABLE_ROWS).exists({ count: 5 });
  });

  test('user can change page size', async function (assert) {
    await visit(urls.targets);
    await click(`[href="${urls.targetWithManyHosts}"]`);

    assert.dom(TABLE_ROWS).exists({ count: 10 });

    await select('[data-test-pagination] select', '30');

    assert.dom(TABLE_ROWS).exists({ count: 15 });
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
