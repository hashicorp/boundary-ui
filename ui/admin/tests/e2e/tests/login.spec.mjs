/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test, expect } from '@playwright/test';

import { LoginPage } from '../pages/login.mjs';

test('Log in, log out, and then log back in @ce @ent @aws @docker', async ({
  page,
}) => {
  await page.goto('/');

  // Log in
  const loginPage = new LoginPage(page);
  await loginPage.login(
    process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
    process.env.E2E_PASSWORD_ADMIN_PASSWORD,
  );
  await expect(
    page.getByRole('navigation', { name: 'breadcrumbs' }).getByText('Orgs'),
  ).toBeVisible();

  // Log out
  await loginPage.logout(process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME);
  await page.reload();

  // Log back in
  await loginPage.login(
    process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
    process.env.E2E_PASSWORD_ADMIN_PASSWORD,
  );
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
  }) => {
    await page
      .getByLabel('Login Name')
      .fill(process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME);
    await page.getByLabel('Password', { exact: true }).fill('badpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole('alert').getByText('Error')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(
      page.getByText(process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME),
    ).toBeHidden();
  });

  test('Log in with only username @ce @ent @aws @docker', async ({ page }) => {
    await page.getByLabel('Login Name').fill('testuser');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole('alert').getByText('Error')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(
      page.getByText(process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME),
    ).toBeHidden();
  });

  test('Log in with only password @ce @ent @aws @docker', async ({ page }) => {
    await page
      .getByLabel('Password', { exact: true })
      .fill(process.env.E2E_PASSWORD_ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole('alert').getByText('Error')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(
      page.getByText(process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME),
    ).toBeHidden();
  });
});
