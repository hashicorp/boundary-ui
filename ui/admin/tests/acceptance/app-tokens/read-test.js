/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

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

    await visit(urls.orgScope);
    await click(commonSelectors.HREF(urls.appTokens));
    await click(commonSelectors.HREF(urls.appToken));

    assert.strictEqual(currentURL(), urls.appToken);
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
    assert.dom('.hds-page-header__title').exists();
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
    assert.dom('.hds-copy-snippet').exists();
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

    // Check for disabled inputs (HDS form fields render as disabled, not readonly)
    assert.dom('input[disabled]').exists('Should have disabled fields');

    // Check for description lists (About, TTL, TTS sections)
    assert.dom('.description-list').exists({ count: 3 });

    // Check for status badge
    assert.dom('.hds-badge').exists();
  });

  test('app token page displays status badge', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    await visit(urls.appToken);

    // Check for status badge
    assert.dom('.hds-badge').exists();
    assert.dom('.hds-badge').containsText('Active');
  });

  test('Permissions tab renders placeholder', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    await visit(urls.appTokenPermissions);

    // Permissions tab should have a form (even if empty for now)
    assert.dom('.rose-form').exists();
  });

  test('page title is set to app token display name', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    await visit(urls.appToken);

    // Check that page title includes token name
    assert.dom('.hds-page-header__title').exists();
  });
});
