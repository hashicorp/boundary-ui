/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

const { test } = require('./fixtures/baseTest');
const { expect } = require('@playwright/test');

test.describe.fixme('Settings Page tests', async () => {
  test('Navigates to settings page', async ({ authedPage }) => {
    await authedPage.getByRole('link', { name: 'Settings' }).click();
    await expect(authedPage).toHaveURL(
      /.*\/scopes\/global\/projects\/settings$/,
    );
  });
});
