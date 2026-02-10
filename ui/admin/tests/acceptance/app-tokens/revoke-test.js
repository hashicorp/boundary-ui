/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { click, currentURL, visit, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { setRunOptions } from 'ember-a11y-testing/test-support';
import * as selectors from './selectors';
import { STATUS_APP_TOKEN_ACTIVE } from 'api/models/app-token';

module('Acceptance | app-tokens | revoke', function (hooks) {
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
    globalScope: null,
    orgScope: null,
    projectScope: null,
    globalAppToken: null,
    orgAppToken: null,
    projectAppToken: null,
    globalCloneAppToken: null,
    orgCloneAppToken: null,
    projectCloneAppToken: null,
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
      status: STATUS_APP_TOKEN_ACTIVE,
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.globalAppToken = `${urls.globalScope}/app-tokens/${instances.appToken.id}`;
    urls.orgAppToken = `${urls.orgScope}/app-tokens/${instances.appToken.id}`;
    urls.projectAppToken = `${urls.projectScope}/app-tokens/${instances.appToken.id}`;

    getAppTokenCount = () => this.server.schema.appTokens.all().models.length;
  });

  test.each(
    'users can revoke an app-token with proper authorization',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-01-15
            enabled: false,
          },
        },
      });
      instances.appToken.update({ scope: instances.scopes[scope] });
      const appTokenCount = getAppTokenCount();
      assert.true(instances.appToken.authorized_actions.includes('revoke'));

      await visit(urls[`${scope}AppToken`]);

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANAGE_DROPDOWN_REVOKE);
      await fillIn(selectors.FILED_CONFIRM_REVOKE, 'REVOKE');
      await click(selectors.CONFIRM_REVOKE_BTN);

      assert.dom(selectors.STATUS_BADGE_TEXT).hasText('Revoked');
      assert.strictEqual(instances.appToken.status, 'revoked');
      assert.strictEqual(currentURL(), urls[`${scope}AppToken`]);
      assert.strictEqual(getAppTokenCount(), appTokenCount);
    },
  );

  test.each(
    'users can cancel revoke action on an app-token with proper authorization',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-01-15
            enabled: false,
          },
        },
      });
      instances.appToken.update({ scope: instances.scopes[scope] });
      const appTokenStatus = instances.appToken.status;

      assert.true(instances.appToken.authorized_actions.includes('revoke'));
      await visit(urls[`${scope}AppToken`]);

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANAGE_DROPDOWN_REVOKE);
      await click(selectors.CANCEL_MODAL_BTN);

      assert.strictEqual(instances.appToken.status, appTokenStatus);
      assert.strictEqual(currentURL(), urls[`${scope}AppToken`]);
    },
  );

  test.each(
    'users cannot revoke an app-token when unauthorized',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-01-15
            enabled: false,
          },
        },
      });
      instances.appToken.update({ scope: instances.scopes[scope] });
      instances.appToken.authorized_actions =
        instances.appToken.authorized_actions.filter(
          (item) => item !== 'revoke' && item !== 'revoke:self',
        );

      await visit(urls[`${scope}AppToken`]);

      assert.false(instances.appToken.authorized_actions.includes('revoke'));
      assert.false(
        instances.appToken.authorized_actions.includes('revoke:self'),
      );

      await click(selectors.MANAGE_DROPDOWN);

      assert.dom(selectors.MANAGE_DROPDOWN_REVOKE).doesNotExist();
      assert.strictEqual(currentURL(), urls[`${scope}AppToken`]);
    },
  );
});
