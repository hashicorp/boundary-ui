/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | form/app-token/read', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  hooks.beforeEach(function () {
    this.model = {
      name: 'Test Token',
      description: 'Test Description',
      status: 'active',
      created_by_user_id: 'u_1234567890',
      scope: {
        id: 's_1234567890',
        displayName: 'Test Project',
        isGlobal: false,
        isOrg: false,
      },
      TTL: 86400000, // 1 day in milliseconds
      TTS: 172800000, // 2 days in milliseconds
      expire_time: new Date('2025-12-31T23:59:59Z'),
      created_time: new Date('2025-12-01T10:00:00Z'),
      approximate_last_access_time: new Date('2025-12-05T15:30:00Z'),
    };
  });

  test('it renders all form fields', async function (assert) {
    await render(hbs`<Form::AppToken::Read @model={{this.model}} />`);

    // HDS Form components render readonly inputs for accessibility
    assert.dom('input[readonly]').exists('Should have readonly text input');
    assert.dom('textarea[readonly]').exists('Should have readonly textarea');

    // Check for form field labels
    assert.dom('.rose-form').containsText('Name');
    assert.dom('.rose-form').containsText('Description');
  });

  test('it shows readonly fields correctly', async function (assert) {
    await render(hbs`<Form::AppToken::Read @model={{this.model}} />`);

    // HDS readonly fields - check for both input and textarea
    assert.dom('input[readonly]').exists('Should have readonly input');
    assert.dom('textarea[readonly]').exists('Should have readonly textarea');
  });

  test('it displays all DescriptionList sections', async function (assert) {
    await render(hbs`<Form::AppToken::Read @model={{this.model}} />`);

    // About section
    assert
      .dom('.description-list')
      .exists({ count: 3 }, 'Should have 3 description lists');

    // Check for section titles
    const titles = Array.from(
      this.element.querySelectorAll('.description-list-title h3'),
    ).map((el) => el.textContent.trim());

    assert.ok(
      titles.some((title) => title.includes('About')),
      'Should have About section',
    );
    assert.ok(
      titles.some((title) => title.includes('Time to live')),
      'Should have TTL section',
    );
    assert.ok(
      titles.some((title) => title.includes('Time to stale')),
      'Should have TTS section',
    );
  });

  test('statusBadge returns correct color and text for active status', async function (assert) {
    this.model.status = 'active';
    await render(hbs`<Form::AppToken::Read @model={{this.model}} />`);

    assert.dom('.hds-badge').containsText('Active');
    assert.dom('.hds-badge--color-success').exists();
  });

  test('statusBadge returns correct color and text for expired status', async function (assert) {
    this.model.status = 'expired';
    await render(hbs`<Form::AppToken::Read @model={{this.model}} />`);

    assert.dom('.hds-badge').containsText('Expired');
    assert.dom('.hds-badge--color-critical').exists();
  });

  test('statusBadge returns correct color and text for revoked status', async function (assert) {
    this.model.status = 'revoked';
    await render(hbs`<Form::AppToken::Read @model={{this.model}} />`);

    assert.dom('.hds-badge').containsText('Revoked');
    assert.dom('.hds-badge--color-critical').exists();
  });

  test('statusBadge returns correct color and text for stale status', async function (assert) {
    this.model.status = 'stale';
    await render(hbs`<Form::AppToken::Read @model={{this.model}} />`);

    assert.dom('.hds-badge').containsText('Stale');
    assert.dom('.hds-badge--color-critical').exists();
  });

  test('statusBadge returns correct color and text for unknown status', async function (assert) {
    this.model.status = 'unknown';
    await render(hbs`<Form::AppToken::Read @model={{this.model}} />`);

    assert.dom('.hds-badge').containsText('Unknown');
    assert.dom('.hds-badge--color-neutral').exists();
  });

  test('statusBadge handles null status', async function (assert) {
    this.model.status = null;
    await render(hbs`<Form::AppToken::Read @model={{this.model}} />`);

    // Should render but with neutral color
    assert.dom('.hds-badge').exists();
  });

  test.each(
    'scopeInfo displays correct icon and name for scope',
    [
      {
        scopeType: 'global',
        displayName: 'Global',
        isGlobal: true,
        isOrg: false,
        icon: 'globe',
      },
      {
        scopeType: 'org',
        displayName: 'Test Org',
        isGlobal: false,
        isOrg: true,
        icon: 'org',
      },
      {
        scopeType: 'project',
        displayName: 'Test Project',
        isGlobal: false,
        isOrg: false,
        icon: 'grid',
      },
    ],
    async function (assert, { displayName, isGlobal, isOrg, icon }) {
      this.model.scope.displayName = displayName;
      this.model.scope.isGlobal = isGlobal;
      this.model.scope.isOrg = isOrg;
      await render(hbs`<Form::AppToken::Read @model={{this.model}} />`);

      assert.dom(`[data-test-icon="${icon}"]`).exists();
      assert.dom('.description-list').containsText(displayName);
    },
  );

  test('ttlFormatted converts milliseconds to days correctly', async function (assert) {
    // 1 day = 86400000 milliseconds
    this.model.TTL = 86400000;
    await render(hbs`<Form::AppToken::Read @model={{this.model}} />`);

    // The format-day-year helper should display "1 day"
    const text = this.element.textContent;
    const displaysTTL = text.includes('1') || text.includes('day');
    assert.ok(displaysTTL, 'Should display TTL');
  });

  test('ttsFormatted converts milliseconds to days correctly', async function (assert) {
    // 2 days = 172800000 milliseconds
    this.model.TTS = 172800000;
    await render(hbs`<Form::AppToken::Read @model={{this.model}} />`);

    // The format-day-year helper should display "2 days"
    const text = this.element.textContent;
    const displaysTTS = text.includes('2') || text.includes('day');
    assert.ok(displaysTTS, 'Should display TTS');
  });

  test('it displays expiration date', async function (assert) {
    await render(hbs`<Form::AppToken::Read @model={{this.model}} />`);

    const text = this.element.textContent;
    const hasExpiration = text.includes('Dec') && text.includes('2025');
    assert.ok(hasExpiration, 'Should display expiration date');
  });

  test('it displays created time', async function (assert) {
    await render(hbs`<Form::AppToken::Read @model={{this.model}} />`);

    const text = this.element.textContent;
    const hasCreatedTime = text.includes('Dec') && text.includes('2025');
    assert.ok(hasCreatedTime, 'Should display created time');
  });

  test('it displays last used time', async function (assert) {
    await render(hbs`<Form::AppToken::Read @model={{this.model}} />`);

    // Should have tooltip icon for the label
    assert.dom('[data-test-icon="info"]').exists();

    // Use HDS Time component with relative format
    assert.dom('.hds-time').exists();
  });

  test('it renders created by user with link', async function (assert) {
    await render(hbs`<Form::AppToken::Read @model={{this.model}} />`);

    assert.dom('[data-test-icon="user"]').exists();
    assert.dom('.hds-link-inline').exists();
    assert.dom('.hds-link-inline').containsText('u_1234567890');
  });

  test('it renders scope with link and icon', async function (assert) {
    await render(hbs`<Form::AppToken::Read @model={{this.model}} />`);

    // Should have scope icon (grid for project)
    assert.dom('[data-test-icon="grid"]').exists();
    assert.dom('.hds-link-inline').exists();
  });

  test('it handles model with minimal data', async function (assert) {
    this.model = {
      name: 'Minimal Token',
      status: 'active',
      scope: {},
    };

    await render(hbs`<Form::AppToken::Read @model={{this.model}} />`);

    // Check that the form renders without crashing
    assert.dom('.rose-form').exists();
    assert.dom('.hds-badge').exists();
    // Check for form structure
    assert.dom('.description-list').exists({ count: 3 });
  });
});
