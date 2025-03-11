/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';

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

  test('check if the done button is present', async function (assert) {
    await visit(urls.success);

    assert.dom(selectors.DONE_BTN).isVisible();
  });

  test('check the controller url is copyable', async function (assert) {
    const origin = window.location.origin;
    await visit(urls.success);

    assert.dom(selectors.COPY_TEXT_BTN).isVisible().hasText(origin);
  });

  test('fill the onboarding form and redirect user to target detail when done is clicked', async function (assert) {
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

    await click(selectors.DONE_BTN);
    const projectId = this.server.schema.scopes.where({ type: 'project' })
      .models[0].id;
    const targetId = this.server.schema.targets.all().models[0].id;
    urls.target = `/scopes/${projectId}/targets/${targetId}`;

    assert.strictEqual(currentURL(), urls.target);
  });
});
