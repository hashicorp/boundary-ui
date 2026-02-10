/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { setRunOptions } from 'ember-a11y-testing/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';

module('Acceptance | app-tokens | read', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    appToken: null,
  };

  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
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

    urls.globalScope = `/scopes/global`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.globalAppTokens = `${urls.globalScope}/app-tokens`;
    urls.orgAppTokens = `${urls.orgScope}/app-tokens`;
    urls.projectAppTokens = `${urls.projectScope}/app-tokens`;
    urls.globalAppToken = `${urls.globalAppTokens}/${instances.appToken.id}`;
    urls.orgAppToken = `${urls.orgAppTokens}/${instances.appToken.id}`;
    urls.projectAppToken = `${urls.projectAppTokens}/${instances.appToken.id}`;
  });

  test.each(
    'users can visit an app token detail page with proper authorization',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      instances.appToken.update({ scope: instances.scopes[scope] });
      await visit(urls[`${scope}AppTokens`]);

      assert.true(instances.appToken.authorized_actions.includes('read'));

      await click(
        commonSelectors.TABLE_RESOURCE_LINK(urls[`${scope}AppToken`]),
      );

      assert
        .dom(commonSelectors.PAGE_HEADER_COPY_SNIPPET)
        .hasText(instances.appToken.id);
      assert.strictEqual(currentURL(), urls[`${scope}AppToken`]);
    },
  );

  test.each(
    'users cannot visit an app token detail page without proper authorization',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      instances.appToken.update({ scope: instances.scopes[scope] });
      instances.appToken.authorized_actions =
        instances.appToken.authorized_actions.filter(
          (item) => item !== 'read' && item !== 'read:self',
        );
      await visit(urls[`${scope}AppTokens`]);

      assert.false(instances.appToken.authorized_actions.includes('read'));
      assert.false(instances.appToken.authorized_actions.includes('read:self'));

      assert
        .dom(commonSelectors.TABLE_RESOURCE_LINK(urls[`${scope}AppToken`]))
        .doesNotExist();
    },
  );

  test.each(
    'Details tab displays app token form',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      setRunOptions({
        rules: {
          'color-contrast': {
            enabled: false,
          },
        },
      });
      instances.appToken.update({ scope: instances.scopes[scope] });
      await visit(urls[`${scope}AppTokens`]);

      await click(
        commonSelectors.TABLE_RESOURCE_LINK(urls[`${scope}AppToken`]),
      );

      assert.strictEqual(currentURL(), urls[`${scope}AppToken`]);
      assert.dom(commonSelectors.FIELD_NAME).hasValue(instances.appToken.name);
      assert
        .dom(commonSelectors.FIELD_DESCRIPTION)
        .hasValue(instances.appToken.description);
      assert.dom(selectors.STATUS_BADGE_TEXT).hasText('Active');
    },
  );

  test.each(
    'app token page displays correct status badge',
    {
      active: {
        status: 'active',
        expectedText: 'Active',
      },
      expired: {
        status: 'expired',
        expectedText: 'Expired',
      },
      revoked: {
        status: 'revoked',
        expectedText: 'Revoked',
      },
      stale: {
        status: 'stale',
        expectedText: 'Stale',
      },
      unknown: {
        status: 'unknown',
        expectedText: 'Unknown',
      },
    },
    async function (assert, { status, expectedText }) {
      setRunOptions({
        rules: {
          'color-contrast': {
            enabled: false,
          },
        },
      });
      instances.appToken.update({ status });

      await visit(urls.globalAppToken);

      assert.dom(selectors.STATUS_BADGE_TEXT).hasText(expectedText);
    },
  );

  test.each(
    'inactive alert is not visible for active app tokens',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      instances.appToken.update({
        scope: instances.scopes[scope],
        status: 'active',
      });
      await visit(urls[`${scope}AppToken`]);

      assert.dom(selectors.STATUS_BADGE_TEXT).hasText('Active');
      assert.dom(selectors.INACTIVE_ALERT).doesNotExist();
    },
  );

  test.each(
    'inactive alert displays correct title based on app token status',
    {
      expired: {
        status: 'expired',
        expectedTitle: 'This app token has expired',
      },
      stale: {
        status: 'stale',
        expectedTitle: 'This app token has staled',
      },
      revoked: {
        status: 'revoked',
        expectedTitle: 'This app token has been revoked',
      },
    },
    async function (assert, { status, expectedTitle }) {
      instances.appToken.update({ status });

      await visit(urls.globalAppToken);

      assert.dom(selectors.INACTIVE_ALERT).isVisible();
      assert.dom(selectors.INACTIVE_ALERT_TITLE).hasText(expectedTitle);
    },
  );
});
