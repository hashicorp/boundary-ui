/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { visit, fillIn, click, currentURL } from '@ember/test-helpers';

module('Acceptance | onboarding', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const urls = {
    onboarding: '/onboarding',
    success: '/onboarding/success',
    orgs: '/scopes/global/scopes',
  };

  hooks.beforeEach(async () => {
    await authenticateSession({});
  });

  test('show targetAddress and targetPort fields', async function (assert) {
    await visit(urls.onboarding);
    assert.dom('[name="targetAddress"]').isVisible();
    assert.dom('[name="targetPort"]').isVisible();
  });

  test('redirect user to success when fill targetAddress, targetPort and click Save', async function (assert) {
    await visit(urls.onboarding);
    await fillIn('[name="targetAddress"]', '192.168.1.0');
    await fillIn('[name="targetPort"]', '22');
    await click('[type="submit"]');
    assert.strictEqual(currentURL(), urls.success);
  });

  test('redirect user to orgs screen when click do this later', async function (assert) {
    await visit(urls.onboarding);
    await click('.rose-form-actions [type="button"]');
    assert.strictEqual(currentURL(), urls.orgs);
  });
});
