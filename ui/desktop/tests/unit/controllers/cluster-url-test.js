/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupIntl } from 'ember-intl/test-support';
import WindowMockIPC from '../../helpers/window-mock-ipc';

module('Unit | Controller | cluster-url', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks, 'en-us');

  let controller;
  let clusterUrl;
  let mockIPC;

  const setupMockIpc = (test) => {
    test.owner.register('service:browser/window', WindowMockIPC);
    mockIPC = test.owner.lookup('service:browser/window').mockIPC;
  };

  hooks.beforeEach(async function () {
    await authenticateSession({});
    controller = this.owner.lookup('controller:cluster-url');
    clusterUrl = this.owner.lookup('service:cluster-url');
    setupMockIpc(this);
  });

  test('it exists', function (assert) {
    assert.ok(controller);
  });

  test('setClusterUrl action de-authenticates a user and resets cluster url', async function (assert) {
    const newClusterUrl = 'http://localhost:9200';
    assert.notEqual(clusterUrl.rendererClusterUrl, newClusterUrl);
    assert.notEqual(mockIPC.clusterUrl, newClusterUrl);

    await controller.setClusterUrl(newClusterUrl);

    assert.strictEqual(clusterUrl.rendererClusterUrl, newClusterUrl);
    assert.strictEqual(mockIPC.clusterUrl, newClusterUrl);
  });
});
