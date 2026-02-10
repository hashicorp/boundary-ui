/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupBoundaryApiMock } from '../../helpers/boundary-api-mock';

module('Unit | Controller | application', function (hooks) {
  setupTest(hooks);
  setupBoundaryApiMock(hooks);

  let controller;
  let clusterUrl;
  let session;

  hooks.beforeEach(async function () {
    await authenticateSession({});
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
    assert.strictEqual(window.boundary.getClusterUrl(), url);

    await controller.disconnect();

    assert.false(session.isAuthenticated);
    assert.notOk(clusterUrl.rendererClusterUrl);
    assert.notOk(window.boundary.getClusterUrl());
  });
});
