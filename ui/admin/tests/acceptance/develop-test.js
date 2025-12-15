/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, getContext } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';

module('Acceptance | develop', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  let featuresService;
  const DEV_TOGGLE_SELECTOR = '[data-test-dev-edition-toggle]';

  hooks.beforeEach(async function () {
    const { owner } = getContext();
    featuresService = owner.lookup('service:features');
    this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
  });

  test('edition toggle is hidden when `dev-edition-toggle` is false', async function (assert) {
    await visit('/');

    assert.false(featuresService.isEnabled('dev-edition-toggle'));
    assert.dom(DEV_TOGGLE_SELECTOR).doesNotExist();
  });

  test('edition toggle is visible when `dev-edition-toggle` is true', async function (assert) {
    assert.false(featuresService.isEnabled('dev-edition-toggle'));
    featuresService.enable('dev-edition-toggle');

    await visit('/');

    assert.dom(DEV_TOGGLE_SELECTOR).isVisible();
  });
});
