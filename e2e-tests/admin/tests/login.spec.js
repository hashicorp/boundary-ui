/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../playwright.config.js'
import { expect } from '@playwright/test';

import { LoginPage } from '../pages/login.js';

test('Log in, log out, and then log back in @ce @ent @aws @docker', async ({
  page,
  adminLoginName,
  adminPassword,
}) => {
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
});

test.describe('Failure Cases', async () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Log in with invalid password @ce @ent @aws @docker', async ({
    page,
    adminLoginName,
  }) => {
    await page
      .getByLabel('Login Name')
      .fill(adminLoginName);
    await page.getByLabel('Password', { exact: true }).fill('badpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole('alert').getByText('Error')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(
      page.getByText(adminLoginName),
    ).toBeHidden();
  });

  test('Log in with only username @ce @ent @aws @docker', async ({
    page,
    adminLoginName,
  }) => {
    await page.getByLabel('Login Name').fill('testuser');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole('alert').getByText('Error')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(
      page.getByText(adminLoginName),
    ).toBeHidden();
  });

  test('Log in with only password @ce @ent @aws @docker', async ({
    page,
    adminLoginName,
    adminPassword,
  }) => {
    await page
      .getByLabel('Password', { exact: true })
      .fill(adminPassword);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole('alert').getByText('Error')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(
      page.getByText(adminLoginName),
    ).toBeHidden();
  });
});
