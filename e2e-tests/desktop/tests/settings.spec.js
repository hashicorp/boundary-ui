/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect, test } from '../fixtures/baseTest.js';

test.describe('Settings Page tests', () => {
  test.beforeEach(async ({ authedPage }) => {
    await authedPage.getByRole('link', { name: 'Settings' }).click();
  });

  test('Navigates to settings page', async ({ authedPage }) => {
    await expect(authedPage).toHaveURL(
      /.*\/scopes\/global\/projects\/settings$/,
    );
  });

  test('Signs out from settings page', async ({ authedPage }) => {
    await authedPage.getByRole('button', { name: 'Sign Out' }).click();
    await expect(authedPage).toHaveURL(/.*\/scopes\/global\/authenticate\//);
  });

  test('Changes log level', async ({ authedPage }) => {
    await authedPage.getByLabel('Logging level').selectOption('warn');
    // Navigate away and back
    await authedPage.getByRole('link', { name: 'Targets' }).click();
    await authedPage.getByRole('link', { name: 'Settings' }).click();

    await expect(authedPage.getByLabel('Logging level')).toHaveValue('warn');
    await authedPage.getByLabel('Logging level').selectOption('debug');
    await expect(authedPage.getByLabel('Logging level')).toHaveValue('debug');
  });

  // TODO: Add some client agent tests? Need to figure out best solution to include client agent
});
