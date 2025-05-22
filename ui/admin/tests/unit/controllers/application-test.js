/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Unit | Controller | application', function (hooks) {
  setupTest(hooks);

  let controller;
  let featureEdition;
  let featuresService;
  let session;
  let router;

  hooks.beforeEach(async function () {
    await authenticateSession({});
    controller = this.owner.lookup('controller:application');
    featureEdition = this.owner.lookup('service:featureEdition');
    featuresService = this.owner.lookup('service:features');
    session = this.owner.lookup('service:session');
    router = this.owner.lookup('service:router');
  });

  test('it exists', function (assert) {
    assert.ok(controller);
  });

  test('invalidateSession action de-authenticates a user', async function (assert) {
    assert.true(session.isAuthenticated);

    await controller.invalidateSession();

    assert.false(session.isAuthenticated);
  });

  test('toggleTheme action sets theme to specified value', function (assert) {
    assert.notOk(session.data.theme);

    controller.toggleTheme('light');

    assert.strictEqual(session.data.theme, 'light');
  });

  test('toggleEdition action sets edition to specified value', function (assert) {
    assert.notOk(featureEdition.edition);

    controller.toggleEdition('oss');

    assert.strictEqual(featureEdition.edition, 'oss');
  });

  test('toggleFeature action toggles specified feature', function (assert) {
    assert.false(featuresService.isEnabled('ssh-target'));

    controller.toggleFeature('ssh-target');

    assert.true(featuresService.isEnabled('ssh-target'));
  });

  test('customRouteChangeValidator returns true when transitioning between different routes', function (assert) {
    const transition = {
      from: router.recognize('/scopes/global/scopes'),
      to: router.recognize('/scopes/global/auth-methods'),
    };

    assert.true(controller.customRouteChangeValidator(transition));

    transition.from = undefined;

    assert.true(controller.customRouteChangeValidator(transition));
  });

  test('customRouteChangeValidator returns true when transitioning between different routes with the same name', function (assert) {
    const transition = {
      from: router.recognize('/scopes/global/scopes'),
      to: router.recognize('/scopes/o_12345/scopes'),
    };

    assert.true(controller.customRouteChangeValidator(transition));
  });

  test('customRouteChangeValidator returns false when transitioning between the same route', function (assert) {
    const transition = {
      from: router.recognize('/scopes/global/scopes'),
      to: router.recognize('/scopes/global/scopes'),
    };

    assert.false(controller.customRouteChangeValidator(transition));

    transition.from = router.recognize('/scopes');
    transition.to = router.recognize('/scopes');

    assert.false(controller.customRouteChangeValidator(transition));
  });

  test('customRouteChangeValidator returns false when transitioning between the same route with query params', function (assert) {
    const transition = {
      from: router.recognize('/scopes/global/scopes?search=xyz'),
      to: router.recognize('/scopes/global/scopes'),
    };

    assert.strictEqual(transition.from.queryParams.search, 'xyz');
    assert.false(controller.customRouteChangeValidator(transition));

    transition.to = router.recognize('/scopes/global/scopes?search=xy');

    assert.strictEqual(transition.to.queryParams.search, 'xy');
    assert.false(controller.customRouteChangeValidator(transition));
  });
});
