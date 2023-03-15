/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, currentURL, find, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | onboarding | success', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    authenticateSession({});
  });

  const urls = {
    onboarding: '/onboarding',
    success: '/onboarding/success',
    target: null,
  };
  const doneButtonSelector = '[data-test-onboarding-done-button]';

  test('check if the done button is present', async function (assert) {
    assert.expect(1);
    await visit(urls.success);
    assert.dom(doneButtonSelector).isVisible();
  });

  test('check the controller url is copyable', async function (assert) {
    assert.expect(2);
    const origin = window.location.origin;
    await visit(urls.success);
    assert.dom('.copyable-content').isVisible();
    assert.strictEqual(find('.copyable-content').textContent.trim(), origin);
  });

  test('fill the onboarding form and redirect user to target detail when done is clicked', async function (assert) {
    assert.expect(1);
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
