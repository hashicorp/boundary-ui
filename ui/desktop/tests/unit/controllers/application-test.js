/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import WindowMockIPC from '../../helpers/window-mock-ipc';

module('Unit | Controller | application', function (hooks) {
  setupTest(hooks);

  let controller;
  let session;
  let clusterUrl;
  let mockIPC;

  const setupMockIpc = (test) => {
    test.owner.register('service:browser/window', WindowMockIPC);
    mockIPC = test.owner.lookup('service:browser/window').mockIPC;
  };

  hooks.beforeEach(async function () {
    authenticateSession({});
    controller = this.owner.lookup('controller:application');
    session = this.owner.lookup('service:session');
    clusterUrl = this.owner.lookup('service:cluster-url');
    setupMockIpc(this);
  });

  test('it exists', function (assert) {
    assert.ok(controller);
    assert.ok(controller.minimize);
    assert.ok(controller.toggleFullScreen);
    assert.ok(controller.close);
  });

  test('invalidateSession action de-authenticates a user', async function (assert) {
    assert.true(session.isAuthenticated);

    await controller.invalidateSession();

    assert.false(session.isAuthenticated);
  });

  test('disconnect action de-authenticates a user and resets cluster url', async function (assert) {
    const url = 'http://localhost:9200';
    await clusterUrl.setClusterUrl(url);

    assert.true(session.isAuthenticated);
    assert.strictEqual(clusterUrl.rendererClusterUrl, url);
    assert.strictEqual(mockIPC.clusterUrl, url);

    await controller.disconnect();

    assert.false(session.isAuthenticated);
    assert.notOk(clusterUrl.rendererClusterUrl);
    assert.notOk(mockIPC.clusterUrl);
  });
});
