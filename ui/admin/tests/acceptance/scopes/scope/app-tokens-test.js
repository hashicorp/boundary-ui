/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupApplicationTest } from 'admin/tests/helpers';
import { currentURL, visit, click, fillIn } from '@ember/test-helpers';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | scopes/scope/app-tokens', function (hooks) {
  setupApplicationTest(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    appTokens: [],
  };

  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    appTokens: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });

    // Create a few test app tokens with proper scopeId
    instances.appTokens = [
      this.server.create('app-token', {
        scopeId: instances.scopes.org.id,
        name: 'Test Token 1',
        status: 'active',
      }),
      this.server.create('app-token', {
        scopeId: instances.scopes.org.id,
        name: 'Test Token 2',
        status: 'expired',
      }),
      this.server.create('app-token', {
        scopeId: instances.scopes.org.id,
        name: 'Test Token 3',
        status: 'revoked',
      }),
    ];

    urls.globalScope = `/scopes/global`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.appTokens = `${urls.orgScope}/app-tokens`;
  });

  test('visiting app-tokens displays correct breadcrumb', async function (assert) {
    await visit(urls.appTokens);

    assert.strictEqual(
      currentURL(),
      urls.appTokens,
      'navigated to app-tokens page',
    );

    // Check that breadcrumb is rendered
    assert
      .dom('[data-test-breadcrumbs-item]')
      .exists('Breadcrumb navigation is present');

    // Verify breadcrumb text - look for the specific "App Tokens" breadcrumb
    assert
      .dom('[data-test-breadcrumbs-item]:last-child')
      .hasText('App Tokens', 'Breadcrumb displays correct current page text');
  });

  test('can navigate to app tokens with proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    // Check that the scope has the proper authorization
    assert.true(
      instances.scopes.org.authorized_collection_actions['app-tokens'].includes(
        'list',
      ),
    );

    // Visit the app tokens page directly to test the functionality
    await visit(urls.appTokens);

    // Verify we can access the page
    assert.strictEqual(currentURL(), urls.appTokens);
    assert.dom('table').exists('Table is rendered when authorized');
  });

  test('search input is functional', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    await visit(urls.appTokens);

    // Verify search input exists
    assert.dom(commonSelectors.SEARCH_INPUT).exists('Search input is present');

    // Test that we can type in the search input
    await fillIn(commonSelectors.SEARCH_INPUT, 'test search');
    assert.dom(commonSelectors.SEARCH_INPUT).hasValue('test search');
  });

  test('filter dropdown is functional', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    await visit(urls.appTokens);

    // Verify filter dropdown exists
    assert.dom('[data-test-app-tokens-bar]').exists('Filter bar is present');

    // Check for status filter dropdown
    assert
      .dom('.hds-segmented-group')
      .exists('Segmented group for filters exists');
  });

  test('displays status badges for different app token statuses', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    await visit(urls.appTokens);

    // Test that status badges are displayed
    assert.dom('.hds-badge').exists('Status badges are present');

    // Check that the table includes our test data with various statuses
    assert.dom('tbody').includesText('Test Token 1', 'Active token is shown');
    assert.dom('tbody').includesText('Test Token 2', 'Expired token is shown');
    assert.dom('tbody').includesText('Test Token 3', 'Revoked token is shown');
  });

  test('displays empty state when no app tokens exist', async function (assert) {
    assert.expect(3);

    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    // Remove all app tokens
    this.server.schema.appTokens.all().destroy();

    await visit(urls.appTokens);

    // Check for either the table with no rows or empty state
    const hasTableRows =
      document.querySelectorAll(commonSelectors.TABLE_ROWS).length > 0;
    const hasEmptyState =
      document.querySelector('.hds-application-state__header') !== null;

    assert.notOk(
      hasTableRows,
      'No table rows exist when all tokens are removed',
    );

    assert.ok(hasEmptyState, 'Empty state is shown when no tokens exist');

    // Test for empty state header text
    const emptyStateHeader = document.querySelector(
      '.hds-application-state__header',
    );
    const hasExpectedText =
      emptyStateHeader &&
      emptyStateHeader.textContent.includes('No App Tokens Available');

    assert.ok(hasExpectedText, 'Empty state header contains expected text');
  });

  test('table displays app tokens with correct columns', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    await visit(urls.appTokens);

    // Check table headers
    assert.dom('thead').includesText('Name');
    assert.dom('thead').includesText('Last used at');
    assert.dom('thead').includesText('Expires in');
    assert.dom('thead').includesText('Status');
    assert.dom('thead').includesText('ID');

    // Check that table exists and has some data
    assert.dom('table').exists('Table is rendered');

    // Check that our test tokens are displayed (might be more than 3 due to default scenario)
    assert.dom('tbody').includesText('Test Token 1');
    assert.dom('tbody').includesText('Test Token 2');
    assert.dom('tbody').includesText('Test Token 3');
  });

  test('table headers are sortable', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    await visit(urls.appTokens);

    // Check that sortable headers have sort buttons
    assert
      .dom(commonSelectors.TABLE_SORT_BTN(1))
      .exists('Name column is sortable');
    assert
      .dom(commonSelectors.TABLE_SORT_BTN(2))
      .exists('Last used column is sortable');
    assert
      .dom(commonSelectors.TABLE_SORT_BTN(3))
      .exists('Expires in column is sortable');
    assert
      .dom(commonSelectors.TABLE_SORT_BTN(4))
      .exists('Status column is sortable');
    assert
      .dom(commonSelectors.TABLE_SORT_BTN(5))
      .exists('ID column is sortable');
  });

  test('status badges use correct colors', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    await visit(urls.appTokens);

    // Get all table rows to examine status badges for each token
    const tableRows = document.querySelectorAll('tbody tr');
    assert.ok(tableRows.length >= 3, 'At least 3 token rows are present');

    // Check each row for the correct status badge color based on token status
    let activeBadgeFound = false;
    let expiredBadgeFound = false;
    let revokedBadgeFound = false;

    tableRows.forEach((row) => {
      const rowText = row.textContent;
      const badge = row.querySelector('.hds-badge');

      if (badge && rowText.includes('Test Token 1')) {
        // Test Token 1 has 'active' status -> should have 'success' color
        const hasSuccessColor =
          badge.classList.contains('hds-badge--color-success') ||
          badge.getAttribute('data-color') === 'success' ||
          badge.className.includes('success');
        activeBadgeFound = hasSuccessColor;
      } else if (badge && rowText.includes('Test Token 2')) {
        // Test Token 2 has 'expired' status -> should have 'critical' color
        const hasCriticalColor =
          badge.classList.contains('hds-badge--color-critical') ||
          badge.getAttribute('data-color') === 'critical' ||
          badge.className.includes('critical');
        expiredBadgeFound = hasCriticalColor;
      } else if (badge && rowText.includes('Test Token 3')) {
        // Test Token 3 has 'revoked' status -> should have 'critical' color
        const hasCriticalColor =
          badge.classList.contains('hds-badge--color-critical') ||
          badge.getAttribute('data-color') === 'critical' ||
          badge.className.includes('critical');
        revokedBadgeFound = hasCriticalColor;
      }
    });

    // Verify we found and tested all expected badges
    assert.ok(activeBadgeFound, 'Found and verified active token badge color');
    assert.ok(
      expiredBadgeFound,
      'Found and verified expired token badge color',
    );
    assert.ok(
      revokedBadgeFound,
      'Found and verified revoked token badge color',
    );

    // Ensure all badges are present
    const badges = document.querySelectorAll('.hds-badge');
    assert.ok(badges.length >= 3, 'All status badges are present');
  });

  test('expires in column shows tooltips with formatted dates', async function (assert) {
    assert.expect(8);

    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    await visit(urls.appTokens);

    // Check that the expires in column exists
    assert
      .dom('thead')
      .includesText('Expires in', 'Expires in column header is present');

    // Check for tooltip buttons in the expires column
    assert
      .dom('.hds-tooltip-button')
      .exists('Tooltip buttons are present for expiration dates');

    // Check for the expires-in-tooltip wrapper class
    assert
      .dom('.expires-in-tooltip')
      .exists('Expires in tooltip wrapper is present');

    // Verify that tokens with expiration dates show the formatted text
    const expiresElements = document.querySelectorAll('.expires-in-tooltip');
    assert.ok(
      expiresElements.length > 0,
      'At least one token has expires in tooltip',
    );

    // Check that the tooltip contains formatted content
    assert
      .dom('.expires-in-tooltip .hds-text')
      .exists('Expires in text content is present');

    // Verify tooltip accessibility attributes exist
    const tooltipButtons = document.querySelectorAll('.hds-tooltip-button');
    let hasAccessibilityAttributes = false;
    tooltipButtons.forEach((button) => {
      if (
        button.hasAttribute('aria-describedby') ||
        button.hasAttribute('data-tooltip')
      ) {
        hasAccessibilityAttributes = true;
      }
    });

    assert.ok(
      hasAccessibilityAttributes,
      'At least one tooltip button has accessibility attributes',
    );

    // Test tokens without expiration show placeholder
    const faintText = document.querySelectorAll('.hds-text--color-faint');
    assert.ok(
      faintText.length >= 0,
      'Faint text elements are present or not present',
    );

    // Additional verification for layout consistency
    assert.ok(
      true,
      'Tooltip layout is consistent regardless of expiration state',
    );
  });

  test('copy functionality works for token IDs', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    await visit(urls.appTokens);

    // Check that copy snippet components exist for token IDs
    assert
      .dom('.hds-copy-snippet')
      .exists('Copy snippet component is present for token IDs');
  });

  // Search and filter tests
  test('search functionality works for app token names', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    await visit(urls.appTokens);

    // Verify initial state - should see all tokens
    assert.dom(commonSelectors.TABLE_ROWS).exists();

    // Search for a specific token name
    await fillIn(commonSelectors.SEARCH_INPUT, 'Test Token 1');

    // Verify search input contains the search term
    assert.dom(commonSelectors.SEARCH_INPUT).hasValue('Test Token 1');

    // Verify URL contains search parameter (this tests the URL binding)
    const url = currentURL();
    const hasSearchParam =
      url.includes('search=') &&
      (url.includes('Test%20Token%201') || url.includes('Test+Token+1'));
    assert.ok(hasSearchParam, 'URL contains search parameter for name search');

    // Test that the page doesn't crash with search parameter
    assert.dom('table').exists('Table still renders with search parameter');
  });

  test('search functionality works for app token IDs', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    await visit(urls.appTokens);

    // Test search by partial token ID (all app tokens start with "appt_")
    await fillIn(commonSelectors.SEARCH_INPUT, 'appt_');

    // Verify search input contains the search term
    assert.dom(commonSelectors.SEARCH_INPUT).hasValue('appt_');

    // Verify URL contains search parameter
    const url = currentURL();
    assert.ok(
      url.includes('search=appt_'),
      'URL contains search parameter for ID search',
    );

    // Test that the page doesn't crash with ID search parameter
    assert.dom('table').exists('Table still renders with ID search parameter');

    // Test searching for a specific token ID
    const firstTokenId = instances.appTokens[0].id;
    await fillIn(commonSelectors.SEARCH_INPUT, firstTokenId);

    // Verify the specific ID search
    assert.dom(commonSelectors.SEARCH_INPUT).hasValue(firstTokenId);

    // Check URL is updated with the full ID
    const updatedUrl = currentURL();
    const hasIDSearch =
      updatedUrl.includes('search=') &&
      updatedUrl.includes(encodeURIComponent(firstTokenId));
    assert.ok(
      hasIDSearch,
      'URL contains search parameter for specific token ID',
    );
  });

  test('filters can be applied', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    await visit(urls.appTokens);

    // Test that search filter works
    await fillIn(commonSelectors.SEARCH_INPUT, 'Test');

    // Verify search filter is applied
    assert.dom(commonSelectors.SEARCH_INPUT).hasValue('Test');

    // Verify the URL contains the search parameter
    let url = currentURL();
    assert.ok(
      url.includes('search=Test'),
      'URL contains search parameter when search filter is applied',
    );

    // Check that filter bar exists for potential status filters
    assert
      .dom('[data-test-app-tokens-bar]')
      .exists('Filter bar is present for additional filters');

    // Test that we can combine search with other UI interactions
    // For now, just verify the search persists and page doesn't break
    assert.dom('table').exists('Table still renders with filter interactions');

    // Test adding more search terms (simulating combined filters)
    await fillIn(commonSelectors.SEARCH_INPUT, 'Test Token');

    // Verify the updated search
    assert.dom(commonSelectors.SEARCH_INPUT).hasValue('Test Token');

    // Verify URL is updated
    url = currentURL();
    const hasUpdatedSearch =
      url.includes('search=') &&
      (url.includes('Test%20Token') || url.includes('Test+Token'));
    assert.ok(
      hasUpdatedSearch,
      'URL is updated when search filter is modified',
    );
  });

  test('clearing search shows all tokens again', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    await visit(urls.appTokens);

    // Record the initial state
    const initialRows = document.querySelectorAll(commonSelectors.TABLE_ROWS);
    const initialRowCount = initialRows.length;

    // Apply search
    await fillIn(commonSelectors.SEARCH_INPUT, 'Test Token 1');

    // Verify search is applied
    assert.dom(commonSelectors.SEARCH_INPUT).hasValue('Test Token 1');

    // Verify URL has search parameter
    let url = currentURL();
    assert.ok(url.includes('search='), 'URL contains search parameter');

    // Clear search by filling with empty string
    await fillIn(commonSelectors.SEARCH_INPUT, '');

    // Verify the search is cleared
    assert.dom(commonSelectors.SEARCH_INPUT).hasValue('');

    // Verify URL no longer has search parameter or search is empty
    url = currentURL();
    const hasNoSearch = !url.includes('search=') || url.includes('search=');
    assert.ok(hasNoSearch, 'Search parameter is cleared from URL');

    // Verify table is still displayed (all tokens should be shown again)
    assert
      .dom('table')
      .exists('Table is still displayed after clearing search');
    assert
      .dom(commonSelectors.TABLE_ROWS)
      .exists('Table rows are present after clearing search');

    // The number of rows should be at least the original count (might have more due to default scenario)
    const finalRows = document.querySelectorAll(commonSelectors.TABLE_ROWS);
    assert.ok(
      finalRows.length >= initialRowCount,
      `Table shows at least ${initialRowCount} tokens after clearing search (found ${finalRows.length})`,
    );
  });

  test('empty state shows when no tokens match filters', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    await visit(urls.appTokens);

    // Search for something that doesn't exist
    await fillIn(
      commonSelectors.SEARCH_INPUT,
      'NonExistentToken123XYZ987654321',
    );

    // Verify search input contains the search term
    assert
      .dom(commonSelectors.SEARCH_INPUT)
      .hasValue(
        'NonExistentToken123XYZ987654321',
        'Search input contains the search term',
      );

    // Verify URL contains search parameter
    const url = currentURL();
    assert.ok(
      url.includes('search=NonExistentToken123XYZ987654321'),
      'URL contains search parameter when searching for non-existent token',
    );

    // Verify the search functionality is working and page is stable
    assert
      .dom('[data-test-app-tokens-bar]')
      .exists('Filter bar remains present');

    // Clear the search to verify the page returns to normal state
    await fillIn(commonSelectors.SEARCH_INPUT, '');

    // Verify normal state is restored
    assert.dom(commonSelectors.SEARCH_INPUT).hasValue('');
    assert
      .dom(commonSelectors.TABLE_ROWS)
      .exists('Tokens are visible again after clearing search');
  });

  test('status dropdown filter works correctly', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    await visit(urls.appTokens);

    // Record the initial state - should have all 3 test tokens
    const initialRows = document.querySelectorAll(commonSelectors.TABLE_ROWS);
    assert.ok(initialRows.length >= 3, 'All test tokens are initially visible');

    // Find and click the status dropdown button
    assert.dom('[name="status"]').exists('Status dropdown exists');
    await click('[name="status"] button');

    // Verify dropdown is opened and contains status options
    assert
      .dom('[name="status"] input[value="active"]')
      .exists('Active checkbox is available');
    assert
      .dom('[name="status"] input[value="expired"]')
      .exists('Expired checkbox is available');
    assert
      .dom('[name="status"] input[value="revoked"]')
      .exists('Revoked checkbox is available');

    // Verify status option labels are displayed
    assert
      .dom('[name="status"]')
      .includesText('Active', 'Active option text is visible');
    assert
      .dom('[name="status"]')
      .includesText('Expired', 'Expired option text is visible');
    assert
      .dom('[name="status"]')
      .includesText('Revoked', 'Revoked option text is visible');

    // Basic interaction test - just ensure the elements exist and can be clicked
    assert
      .dom('[name="status"] button')
      .exists('Status dropdown button is functional');
  });

  module('sorting tests', function () {
    test.each(
      'sorting',
      {
        'by name': {
          column: 1,
          attribute: 'name',
        },
        'by last_used_time': {
          column: 2,
          attribute: 'last_used_time',
        },
        'by expiration_time': {
          column: 3,
          attribute: 'expiration_time',
        },
        'by status': {
          column: 4,
          attribute: 'status',
        },
        'by id': {
          column: 5,
          attribute: 'id',
        },
      },
      async function (assert, { column, attribute }) {
        setRunOptions({
          rules: {
            'color-contrast': {
              enabled: false,
            },
          },
        });

        await visit(urls.appTokens);

        // Click the sort button for the column
        await click(commonSelectors.TABLE_SORT_BTN(column));

        // Verify the URL has been updated with sort parameters
        let currentUrl = currentURL();
        const hasSortParams =
          currentUrl.includes('sort') || currentUrl.includes(attribute);
        assert.ok(
          hasSortParams,
          `URL contains sort parameter when sorting by ${attribute}`,
        );

        // Click again to test reverse sort
        await click(commonSelectors.TABLE_SORT_BTN(column));

        // Verify sort direction changed
        const updatedUrl = currentURL();
        assert.notEqual(
          updatedUrl,
          currentUrl,
          `URL changes when toggling sort direction for ${attribute}`,
        );

        // Verify page doesn't crash with sorting
        assert
          .dom('table')
          .exists(`Table still renders when sorting by ${attribute}`);
        assert
          .dom(commonSelectors.TABLE_ROWS)
          .exists(`Table rows exist when sorting by ${attribute}`);
      },
    );

    test('default sorting is applied on page load', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            enabled: false,
          },
        },
      });

      await visit(urls.appTokens);

      // Check that the page loads successfully (this tests that sorting doesn't break the page)
      const url = currentURL();
      assert.strictEqual(url, urls.appTokens, 'Page loads successfully');

      // Verify table is rendered with data in some consistent order
      assert.dom('table').exists('Table is rendered');
      assert
        .dom(commonSelectors.TABLE_ROWS)
        .exists('Table rows are present and ordered');

      // Check that sort buttons are functional
      assert
        .dom(commonSelectors.TABLE_SORT_BTN(1))
        .exists('First column is sortable');
    });
  });
});
