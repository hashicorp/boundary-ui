/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../../global-setup.js';
import { expect } from '@playwright/test';

import { LoginPage } from '../pages/login.js';

// Reset storage state for this file to avoid being authenticated
test.use({ storageState: { cookies: [], origins: [] } });

test(
  'Log in, log out, and then log back in',
  { tag: ['@ce', '@ent', '@aws', '@docker'] },
  async ({ page, adminLoginName, adminPassword }) => {
    await page.goto('/');

    // Log in
    const loginPage = new LoginPage(page);
    await loginPage.login(adminLoginName, adminPassword);
    await expect(
      page.getByRole('navigation', { name: 'breadcrumbs' }).getByText('Orgs'),
    ).toBeVisible();

    // Log out
    await loginPage.logout(adminLoginName);
    await page.reload();

    // Log back in
    await loginPage.login(adminLoginName, adminPassword);
    await expect(
      page.getByRole('navigation', { name: 'breadcrumbs' }).getByText('Orgs'),
    ).toBeVisible();
  },
);

test.describe('Failure Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test(
    'Log in with invalid password',
    { tag: ['@ce', '@ent', '@aws', '@docker'] },
    async ({ page, adminLoginName }) => {
      await page.getByLabel('Login Name').fill(adminLoginName);
      await page.getByLabel('Password', { exact: true }).fill('badpassword');
      await page.getByRole('button', { name: 'Sign In' }).click();
      await expect(page.getByRole('alert').getByText('Error')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
      await expect(page.getByText(adminLoginName)).toBeHidden();
    },
  );

  test(
    'Log in with only username',
    { tag: ['@ce', '@ent', '@aws', '@docker'] },
    async ({ page, adminLoginName }) => {
      await page.getByLabel('Login Name').fill('testuser');
      await page.getByRole('button', { name: 'Sign In' }).click();
      await expect(page.getByRole('alert').getByText('Error')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
      await expect(page.getByText(adminLoginName)).toBeHidden();
    },
  );

  test(
    'Log in with only password',
    { tag: ['@ce', '@ent', '@aws', '@docker'] },
    async ({ page, adminLoginName, adminPassword }) => {
      await page.getByLabel('Password', { exact: true }).fill(adminPassword);
      await page.getByRole('button', { name: 'Sign In' }).click();
      await expect(page.getByRole('alert').getByText('Error')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
      await expect(page.getByText(adminLoginName)).toBeHidden();
    },
  );
});
