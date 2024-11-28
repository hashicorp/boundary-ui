/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | policies | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let featuresService;
  let policyCount;

  const DROPDOWN_BUTTON_SELECTOR = '.hds-dropdown-toggle-icon';
  const DROPDOWN_ITEM_SELECTOR = '.hds-dropdown-list-item button';

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
    const count = policyCount();
    featuresService.enable('ssh-session-recording');

    assert.true(instances.policy.authorized_actions.includes('delete'));
    await visit(urls.globalScope);

    urls.policy = `${urls.policies}/${instances.policy.id}`;

    await click(`[href="${urls.policies}"]`);
    await click(DROPDOWN_BUTTON_SELECTOR);

    assert.dom(DROPDOWN_ITEM_SELECTOR).exists();
    assert.dom(DROPDOWN_ITEM_SELECTOR).hasText('Delete Storage Policy');

    await click(DROPDOWN_ITEM_SELECTOR);
    assert.strictEqual(policyCount(), count - 1);
  });

  test('users cannot delete a storage policy without proper authorization', async function (assert) {
    featuresService.enable('ssh-session-recording');

    instances.policy.authorized_actions =
      instances.policy.authorized_actions.filter((item) => item !== 'delete');

    await visit(urls.globalScope);

    urls.policy = `${urls.policies}/${instances.policy.id}`;

    await click(`[href="${urls.policies}"]`);
    await click(DROPDOWN_BUTTON_SELECTOR);

    assert.dom(DROPDOWN_ITEM_SELECTOR).isNotVisible();
  });
});
