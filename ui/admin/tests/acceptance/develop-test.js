/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, getContext } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | develop', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);
  setupSqlite(hooks);

  let featuresService;
  const DEV_TOGGLE_SELECTOR = '[data-test-dev-edition-toggle]';

  hooks.beforeEach(async function () {
    const { owner } = getContext();
    featuresService = owner.lookup('service:features');
    this.server.create('scope', { id: 'global' });
    this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    await authenticateSession({});
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
