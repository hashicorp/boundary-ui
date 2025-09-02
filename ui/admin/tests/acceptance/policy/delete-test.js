/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | policies | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);

  let featuresService;
  let policyCount;

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    policy: null,
  };

  const urls = {
    globalScope: null,
    policies: null,
    policy: null,
  };

  hooks.beforeEach(async function () {
    await authenticateSession({});
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });

    instances.policy = this.server.create('policy', {
      scope: instances.scopes.global,
    });

    urls.globalScope = `/scopes/global`;
    urls.policies = `${urls.globalScope}/policies`;

    featuresService = this.owner.lookup('service:features');
    policyCount = () => this.server.schema.policies.all().models.length;
  });

  test('users can delete a storage policy', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const count = policyCount();
    featuresService.enable('ssh-session-recording');

    assert.true(instances.policy.authorized_actions.includes('delete'));
    await visit(urls.globalScope);

    urls.policy = `${urls.policies}/${instances.policy.id}`;

    await click(commonSelectors.HREF(urls.policies));
    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);

    assert
      .dom(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_BTN)
      .exists()
      .hasText('Delete Storage Policy');

    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_BTN);

    assert.strictEqual(policyCount(), count - 1);
  });

  test('users cannot delete a storage policy without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('ssh-session-recording');

    instances.policy.authorized_actions =
      instances.policy.authorized_actions.filter((item) => item !== 'delete');

    await visit(urls.globalScope);

    urls.policy = `${urls.policies}/${instances.policy.id}`;

    await click(commonSelectors.HREF(urls.policies));
    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);

    assert
      .dom(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_BTN)
      .isNotVisible();
  });
});
