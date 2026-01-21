/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
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
    appTokens: null,
    newAppToken: null,
    appToken: null,
    appTokenPermissions: null,
    unknownAppToken: null,
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

    urls.globalScope = `/scopes/global`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.appTokens = `${urls.orgScope}/app-tokens`;
    urls.newAppToken = `${urls.appTokens}/new`;
    urls.appToken = `${urls.appTokens}/${instances.appToken.id}`;
    urls.appTokenPermissions = `${urls.appToken}/permissions`;
    urls.unknownAppToken = `${urls.appTokens}/at_unknown123`;
  });

  test('visiting an app token detail page', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    await visit(urls.appToken);

    assert.strictEqual(currentURL(), urls.appToken);
    assert.dom('.hds-page-header__title').containsText('App Tokens');
  });

  test('app token detail page displays correct title and breadcrumbs', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    await visit(urls.appToken);

    // Check page header title
    assert.dom('.hds-page-header__title').containsText('App Tokens');

    // Check breadcrumbs
    assert.dom('.hds-breadcrumb').exists();
  });

  test('app token detail page displays token ID copy snippet', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    await visit(urls.appToken);

    // Check for copy snippet with token ID
    assert
      .dom('.hds-copy-snippet')
      .containsText(instances.appToken.id.substring(0, 10));
  });

  test('app token detail page displays tabs', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    await visit(urls.appToken);

    // Check for Details tab
    assert.dom(commonSelectors.HREF(urls.appToken)).exists();

    // Check for Permissions tab
    assert.dom(commonSelectors.HREF(urls.appTokenPermissions)).exists();
  });

  test('can navigate between Details and Permissions tabs', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    await visit(urls.appToken);
    assert.strictEqual(currentURL(), urls.appToken);

    // Navigate to Permissions tab
    await click(commonSelectors.HREF(urls.appTokenPermissions));
    assert.strictEqual(currentURL(), urls.appTokenPermissions);

    // Navigate back to Details tab
    await click(commonSelectors.HREF(urls.appToken));
    assert.strictEqual(currentURL(), urls.appToken);
  });

  test('Details tab displays app token form', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    await visit(urls.appToken);

    // Check that the form component is rendered
    assert.dom('.rose-form').exists();

    // Check for form field labels
    assert.dom('.rose-form').containsText('Name');
    assert.dom('.rose-form').containsText('Description');

    // Check for section titles
    assert.dom('.rose-form').containsText('About this token');
    assert.dom('.rose-form').containsText('Time to live');
    assert.dom('.rose-form').containsText('Time to stale');

    // Check for readonly inputs for accessibility
    assert.dom('input[readonly]').exists('Should have readonly fields');

    // Check for description lists (About, TTL, TTS sections)
    assert.dom('.description-list').exists({ count: 3 });

    // Check for status badge
    assert.dom('.hds-badge').exists();
  });

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

      // Update the token status
      instances.appToken.update({ status });

      await visit(urls.appToken);

      // Check for status badge with correct text
      assert.dom('.hds-badge').containsText(expectedText);
    },
  );

  test('users can revoke an app-token with proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-01-15
          enabled: false,
        },
      },
    });

    assert.true(instances.appToken.authorized_actions.includes('revoke'));
    await visit(urls.appToken);

    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.MANAGE_DROPDOWN_REVOKE);
    await fillIn(selectors.FILED_CONFIRM_REVOKE, 'REVOKE');
    await click(selectors.CONFIRM_REVOKE_BTN);

    assert.dom(selectors.STATUS_BADGE_TEXT).hasText('Revoked');
    assert.strictEqual(instances.appToken.status, 'revoked');
    assert.strictEqual(currentURL(), urls.appToken);
  });

  test('users can cancel revoke action on an app-token with proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-01-15
          enabled: false,
        },
      },
    });
    const appTokenStatus = instances.appToken.status;

    assert.true(instances.appToken.authorized_actions.includes('revoke'));
    await visit(urls.appToken);

    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.MANAGE_DROPDOWN_REVOKE);
    await click(selectors.CANCEL_MODAL_BTN);

    assert.strictEqual(instances.appToken.status, appTokenStatus);
    assert.strictEqual(currentURL(), urls.appToken);
  });

  test('users cannot revoke an app-token when unauthorized', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-01-15
          enabled: false,
        },
      },
    });
    instances.appToken.authorized_actions =
      instances.appToken.authorized_actions.filter(
        (item) => item !== 'revoke' && item !== 'revoke:self',
      );

    await visit(urls.appToken);

    assert.false(instances.appToken.authorized_actions.includes('revoke'));
    assert.false(instances.appToken.authorized_actions.includes('revoke:self'));

    await click(selectors.MANAGE_DROPDOWN);

    assert.dom(selectors.MANAGE_DROPDOWN_REVOKE).doesNotExist();
    assert.strictEqual(currentURL(), urls.appToken);
  });

  test('users can clone an app-token with proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-01-20
          enabled: false,
        },
      },
    });

    assert.true(instances.appToken.authorized_actions.includes('read'));
    await visit(urls.appToken);

    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.MANAGE_DROPDOWN_CLONE);

    assert.strictEqual(currentURL(), urls.newAppToken);
  });

  test('users cannot clone an app-token without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-01-15
          enabled: false,
        },
      },
    });
    instances.scopes.org.authorized_collection_actions['app-tokens'] =
      instances.scopes.org.authorized_collection_actions['app-tokens'].filter(
        (item) => item !== 'create',
      );
    instances.appToken.authorized_actions =
      instances.appToken.authorized_actions.filter(
        (item) => item !== 'read' && item !== 'read:self',
      );

    assert.false(
      instances.scopes.org.authorized_collection_actions['app-tokens'].includes(
        'create',
      ),
    );
    assert.false(instances.appToken.authorized_actions.includes('read'));
    assert.false(instances.appToken.authorized_actions.includes('read:self'));

    await visit(urls.appToken);

    await click(selectors.MANAGE_DROPDOWN);

    assert.dom(selectors.MANAGE_DROPDOWN_CLONE).doesNotExist();
    assert.strictEqual(currentURL(), urls.appToken);
  });
});
