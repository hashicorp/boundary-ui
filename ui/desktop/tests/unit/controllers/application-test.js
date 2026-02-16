/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import WindowMockIPC from '../../helpers/window-mock-ipc';

module('Unit | Controller | application', function (hooks) {
  setupTest(hooks);

  let controller;
  let clusterUrl;
  let mockIPC;
  let session;

  const setupMockIpc = (test) => {
    test.owner.register('service:browser/window', WindowMockIPC);
    mockIPC = test.owner.lookup('service:browser/window').mockIPC;
  };

  hooks.beforeEach(async function () {
    await authenticateSession({});
    setupMockIpc(this);
    controller = this.owner.lookup('controller:application');
    session = this.owner.lookup('service:session');
    clusterUrl = this.owner.lookup('service:cluster-url');
  });

  test('it exists', function (assert) {
    assert.ok(controller);
    assert.ok(controller.minimize);
    assert.ok(controller.toggleFullScreen);
    assert.ok(controller.close);
    assert.ok(controller.confirmCloseSessions);
    assert.ok(controller.showModalOrLogout);
  });

  test('toggleTheme action sets theme to specified value', function (assert) {
    assert.notOk(session.data.theme);

    controller.toggleTheme('light');

    assert.strictEqual(session.data.theme, 'light');
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
