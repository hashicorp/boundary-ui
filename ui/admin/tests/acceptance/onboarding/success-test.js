/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, find, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | onboarding | success', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await authenticateSession({});
  });

  const urls = {
    onboarding: '/onboarding',
    success: '/onboarding/success',
    target: null,
  };
  const doneButtonSelector = '[data-test-onboarding-done-button]';

  test('check if the done button is present', async function (assert) {
    await visit(urls.success);
    assert.dom(doneButtonSelector).isVisible();
  });

  test('check the controller url is copyable', async function (assert) {
    const origin = window.location.origin;
    await visit(urls.success);
    assert.dom('.hds-copy-snippet__text').isVisible();
    assert.strictEqual(
      find('.hds-copy-snippet__text').textContent.trim(),
      origin,
    );
  });

  test('fill the onboarding form and redirect user to target detail when done is clicked', async function (assert) {
    await visit(urls.onboarding);
    await fillIn('[name="targetAddress"]', '0.0.0.0');
    await fillIn('[name="targetPort"]', '22');
    await click('[type="submit"]');
    await click(doneButtonSelector);
    const projectId = this.server.db.scopes.where({ type: 'project' })[0].id;
    const targetId = this.server.db.targets[0].id;
    urls.target = `/scopes/${projectId}/targets/${targetId}`;
    assert.strictEqual(currentURL(), urls.target);
  });
});
