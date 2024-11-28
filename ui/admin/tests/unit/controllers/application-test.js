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

  hooks.beforeEach(async function () {
    await authenticateSession({});
    controller = this.owner.lookup('controller:application');
    featureEdition = this.owner.lookup('service:featureEdition');
    featuresService = this.owner.lookup('service:features');
    session = this.owner.lookup('service:session');
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
});
