/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { visit, fillIn, click, currentURL } from '@ember/test-helpers';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';

module('Acceptance | onboarding', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);

  const urls = {
    onboarding: '/onboarding',
    success: '/onboarding/success',
    orgs: '/scopes/global/scopes',
  };

  hooks.beforeEach(async function () {
    await authenticateSession({});
  });

  test('show targetAddress and targetPort fields', async function (assert) {
    await visit(urls.onboarding);

    assert.dom(selectors.FIELD_TARGET_ADDRESS).isVisible();
    assert.dom(selectors.FIELD_TARGET_PORT).isVisible();
  });

  test('redirect user to success when fill targetAddress, targetPort and click Save', async function (assert) {
    await visit(urls.onboarding);

    await fillIn(
      selectors.FIELD_TARGET_ADDRESS,
      selectors.FIELD_TARGET_ADDRESS_VALUE,
    );
    await fillIn(
      selectors.FIELD_TARGET_PORT,
      selectors.FIELD_TARGET_PORT_VALUE,
    );
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.success);
  });

  test('redirect user to orgs screen when click do this later', async function (assert) {
    await visit(urls.onboarding);

    await click(selectors.DO_THIS_LATER_BTN);

    assert.strictEqual(currentURL(), urls.orgs);
  });
});
