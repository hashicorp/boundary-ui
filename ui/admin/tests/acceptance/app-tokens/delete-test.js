/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import * as selectors from './selectors';

module('Acceptance | app-tokens | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  let appTokensCount;

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    appToken: null,
  };

  const urls = {
    appTokens: null,
    appToken: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.appToken = this.server.create('app-token', {
      scope: instances.scopes.org,
      name: 'Test App Token',
      description: 'Test token description',
      status: 'active',
    });

    urls.appTokens = `/scopes/${instances.scopes.org.id}/app-tokens`;
    urls.appToken = `${urls.appTokens}/${instances.appToken.id}`;

    appTokensCount = () => this.server.schema.appTokens.all().models.length;
  });

  test('users can delete an app-token with proper authorization', async function (assert) {
    const count = appTokensCount();
    await visit(urls.appToken);

    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.MANAGE_DROPDOWN_DELETE);
    await fillIn(selectors.FILED_CONFIRM_DELETE, 'DELETE');
    await click(selectors.CONFIRM_DELETE_BTN);

    assert.strictEqual(currentURL(), urls.appTokens);
    assert.strictEqual(appTokensCount(), count - 1);
  });

  test('users can cancel delete action on an app-token with proper authorization', async function (assert) {
    const count = appTokensCount();
    await visit(urls.appToken);

    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.MANAGE_DROPDOWN_DELETE);
    await click(selectors.CANCEL_MODAL_BTN);

    assert.strictEqual(currentURL(), urls.appToken);
    assert.strictEqual(appTokensCount(), count);
  });

  test('users cannot delete an app-token when unauthorized', async function (assert) {
    instances.appToken.authorized_actions =
      instances.appToken.authorized_actions.filter(
        (item) => item !== 'delete' && item !== 'delete:self',
      );

    await visit(urls.appToken);

    assert.false(instances.appToken.authorized_actions.includes('delete'));
    assert.false(instances.appToken.authorized_actions.includes('delete:self'));

    await click(selectors.MANAGE_DROPDOWN);

    assert.dom(selectors.MANAGE_DROPDOWN_DELETE).doesNotExist();
    assert.strictEqual(currentURL(), urls.appToken);
  });
});
