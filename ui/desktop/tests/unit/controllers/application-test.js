/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Unit | Controller | application', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  let controller;
  let session;
  let clusterUrl;

  const setDefaultClusterUrl = () => {
    const windowOrigin = window.location.origin;
    clusterUrl.rendererClusterUrl = windowOrigin;
  };

  hooks.beforeEach(async function () {
    authenticateSession({});
    controller = this.owner.lookup('controller:application');
    session = this.owner.lookup('service:session');
    clusterUrl = this.owner.lookup('service:cluster-url');
    setDefaultClusterUrl();
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
    assert.true(session.isAuthenticated);
    assert.ok(clusterUrl.rendererClusterUrl);

    await controller.disconnect();

    assert.false(session.isAuthenticated);
    assert.notOk(clusterUrl.rendererClusterUrl);
  });
});
