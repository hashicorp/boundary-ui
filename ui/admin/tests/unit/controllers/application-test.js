/**
 * Copyright IBM Corp. 2021, 2025
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

  test.each(
    'customRouteChangeValidator',
    [
      {
        from: '/scopes',
        to: '/scopes',
        expectedResult: false,
      },
      {
        from: '/scopes/global/scopes',
        to: '/scopes/global/scopes',
        expectedResult: false,
      },
      {
        from: '/scopes/global/scopes?search=xyz',
        to: '/scopes/global/scopes',
        expectedResult: false,
      },
      {
        from: '/scopes/global/scopes?search=xyz',
        to: '/scopes/global/scopes?search=xy',
        expectedResult: false,
      },
      {
        to: '/scopes/global/scopes',
        expectedResult: true,
      },
      {
        from: '/scopes/global/scopes',
        expectedResult: true,
      },
      {
        from: '/scopes/global/scopes',
        to: '/scopes/global/auth-methods',
        expectedResult: true,
      },
      {
        from: '/scopes/global/scopes',
        to: '/scopes/o_12345/scopes',
        expectedResult: true,
      },
      {
        from: '/scopes/global/roles/r_123/scopes',
        to: '/scopes/global/roles/r_321/scopes',
        expectedResult: true,
      },
    ],

    async function (assert, input) {
      const transition = {
        from: input.from ? router.recognize(input.from) : undefined,
        to: input.to ? router.recognize(input.to) : undefined,
      };

      assert.strictEqual(
        controller.customRouteChangeValidator(transition),
        input.expectedResult,
      );
    },
  );
});
