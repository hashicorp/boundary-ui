/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupDesktopContextBridgeApiMock } from '../../helpers/desktop-context-bridge-api-mock';

module('Unit | Controller | cluster-url', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks, 'en-us');

  let controller;
  let clusterUrl;

  setupDesktopContextBridgeApiMock(hooks);

  hooks.beforeEach(async function () {
    await authenticateSession({});
    controller = this.owner.lookup('controller:cluster-url');
    clusterUrl = this.owner.lookup('service:cluster-url');
  });

  test('it exists', function (assert) {
    assert.ok(controller);
  });

  test('setClusterUrl action de-authenticates a user and resets cluster url', async function (assert) {
    const newClusterUrl = 'http://localhost:9200';
    assert.notEqual(clusterUrl.rendererClusterUrl, newClusterUrl);
    assert.notEqual(window.desktop.clusterUrl, newClusterUrl);

    await controller.setClusterUrl(newClusterUrl);

    assert.strictEqual(clusterUrl.rendererClusterUrl, newClusterUrl);
    assert.strictEqual(window.desktop.clusterUrl, newClusterUrl);
  });
});
