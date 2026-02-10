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

  let getAppTokenCount;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    appToken: null,
  };

  const urls = {
    globalAppTokens: null,
    orgAppTokens: null,
    projectAppTokens: null,
    globalAppToken: null,
    orgAppToken: null,
    projectAppToken: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.global = this.server.schema.scopes.find('global');
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.appToken = this.server.create('app-token', {
      scope: instances.scopes.global,
      name: 'Test App Token',
      description: 'Test token description',
      status: 'active',
    });

    urls.globalAppTokens = `/scopes/global/app-tokens`;
    urls.orgAppTokens = `/scopes/${instances.scopes.org.id}/app-tokens`;
    urls.projectAppTokens = `/scopes/${instances.scopes.project.id}/app-tokens`;
    urls.globalAppToken = `${urls.globalAppTokens}/${instances.appToken.id}`;
    urls.orgAppToken = `${urls.orgAppTokens}/${instances.appToken.id}`;
    urls.projectAppToken = `${urls.projectAppTokens}/${instances.appToken.id}`;

    getAppTokenCount = () => this.server.schema.appTokens.all().models.length;
  });

  test.each(
    'users can delete an app-token with proper authorization',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      instances.appToken.update({ scope: instances.scopes[scope] });
      const count = getAppTokenCount();
      await visit(urls[`${scope}AppToken`]);

      assert.true(instances.appToken.authorized_actions.includes('delete'));
      assert.true(
        instances.appToken.authorized_actions.includes('delete:self'),
      );

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANAGE_DROPDOWN_DELETE);
      await fillIn(selectors.FILED_CONFIRM_DELETE, 'DELETE');
      await click(selectors.CONFIRM_DELETE_BTN);

      assert.strictEqual(currentURL(), urls[`${scope}AppTokens`]);
      assert.strictEqual(getAppTokenCount(), count - 1);
    },
  );

  test.each(
    'users can cancel delete action on an app-token with proper authorization',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      instances.appToken.update({ scope: instances.scopes[scope] });
      const count = getAppTokenCount();
      await visit(urls[`${scope}AppToken`]);

      assert.true(instances.appToken.authorized_actions.includes('delete'));
      assert.true(
        instances.appToken.authorized_actions.includes('delete:self'),
      );

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANAGE_DROPDOWN_DELETE);
      await click(selectors.CANCEL_MODAL_BTN);

      assert.strictEqual(currentURL(), urls[`${scope}AppToken`]);
      assert.strictEqual(getAppTokenCount(), count);
    },
  );

  test.each(
    'users cannot delete an app-token when unauthorized',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      instances.appToken.update({ scope: instances.scopes[scope] });
      instances.appToken.authorized_actions =
        instances.appToken.authorized_actions.filter(
          (item) => item !== 'delete' && item !== 'delete:self',
        );

      await visit(urls[`${scope}AppToken`]);

      assert.false(instances.appToken.authorized_actions.includes('delete'));
      assert.false(
        instances.appToken.authorized_actions.includes('delete:self'),
      );

      await click(selectors.MANAGE_DROPDOWN);

      assert.dom(selectors.MANAGE_DROPDOWN_DELETE).doesNotExist();
      assert.strictEqual(currentURL(), urls[`${scope}AppToken`]);
    },
  );
});
