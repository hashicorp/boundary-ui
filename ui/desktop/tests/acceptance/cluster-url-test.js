/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, fillIn, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import sinon from 'sinon';
import { invalidateSession } from 'ember-simple-auth/test-support';
import { setupBrowserFakes } from 'ember-browser-services/test-support';
import WindowMockIPC from '../helpers/window-mock-ipc';
import config from '../../config/environment';

module('Acceptance | clusterUrl', function (hooks) {
  setupApplicationTest(hooks);
  setupBrowserFakes(hooks, { window: true });
  setupMirage(hooks);

  const currentOrigin = window.location.origin;
  let mockIPC;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    authMethods: {
      global: null,
      org: null,
    },
    hostCatalog: null,
    target: null,
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
    },
    authenticate: {
      global: null,
      methods: {
        global: null,
      },
    },
    projects: null,
    targets: null,
  };
  const setupMockIpc = (test) => {
    test.owner.register('service:browser/window', WindowMockIPC);
    mockIPC = test.owner.lookup('service:browser/window').mockIPC;
  };

  hooks.beforeEach(async function () {
    await invalidateSession();

    let rdpService = this.owner.lookup('service:rdp');
    sinon.stub(rdpService, 'getRdpClients').resolves();
    sinon.stub(rdpService, 'getPreferredRdpClient').resolves();

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
      'withChildren',
    );
    instances.target = this.server.create(
      'target',
      { scope: instances.scopes.project },
      'withAssociations',
    );

    urls.scopes.global = `/scopes/${instances.scopes.global.id}`;
    urls.authenticate.global = `${urls.scopes.global}/authenticate`;
    urls.authenticate.methods.global = `${urls.authenticate.global}/${instances.authMethods.global.id}`;
    urls.projects = `${urls.scopes.global}/projects`;
    urls.targets = `${urls.projects}/targets`;
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  test('visiting index', async function (assert) {
    assert.expect(1);
    await visit(urls.clusterUrl);

    assert.strictEqual(currentURL(), urls.clusterUrl);
  });

  test('visiting index without a clusterUrl specified redirects to clusterUrl route', async function (assert) {
    assert.expect(2);
    setupMockIpc(this);
    await visit(urls.index);

    assert.notOk(mockIPC.clusterUrl);
    assert.strictEqual(currentURL(), urls.clusterUrl);
  });

  test('can set clusterUrl', async function (assert) {
    assert.expect(3);
    setupMockIpc(this);
    assert.notOk(mockIPC.clusterUrl);
    await visit(urls.clusterUrl);
    await fillIn('[name="host"]', currentOrigin);
    await click('[type="submit"]');
    assert.strictEqual(currentURL(), urls.authenticate.methods.global);
    assert.strictEqual(mockIPC.clusterUrl, currentOrigin);
  });

  test('can reset clusterUrl before authentication', async function (assert) {
    assert.expect(4);
    setupMockIpc(this);
    assert.notOk(mockIPC.clusterUrl);
    await visit(urls.clusterUrl);
    await fillIn('[name="host"]', currentOrigin);
    await click('[type="submit"]');
    assert.strictEqual(currentURL(), urls.authenticate.methods.global);
    assert.strictEqual(mockIPC.clusterUrl, currentOrigin);
    await click('.change-origin a');
    assert.strictEqual(currentURL(), urls.clusterUrl);
  });

  test('captures error on clusterUrl update', async function (assert) {
    assert.expect(2);
    setupMockIpc(this);
    assert.notOk(mockIPC.clusterUrl);
    sinon
      .stub(this.owner.lookup('service:clusterUrl'), 'setClusterUrl')
      .throws();
    await visit(urls.clusterUrl);
    await fillIn('[name="host"]', currentOrigin);
    await click('[type="submit"]');
    assert
      .dom('[data-test-toast-notification].hds-alert--color-critical')
      .isVisible();
  });

  test('clusterUrl set automatically when autoOrigin is true', async function (assert) {
    assert.expect(1);
    config.autoOrigin = true;
    await visit(urls.clusterUrl);
    assert.strictEqual(find('[name="host"]').value, currentOrigin);
    config.autoOrigin = false;
  });

  test('clusterUrl is *not* set automatically when autoOrigin is false', async function (assert) {
    assert.expect(2);
    assert.notOk(config.autoOrigin, 'autoOrigin is disabled');
    await visit(urls.clusterUrl);
    assert.notOk(find('[name="host"]').value, 'Origin field is empty');
  });
});
