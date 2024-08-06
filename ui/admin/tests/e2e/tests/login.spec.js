/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

const { test, expect } = require('@playwright/test');

test('Log in, log out, and then log back in @ce @ent @aws @docker', async ({
  page,
}) => {
  await page.goto('/');

  // Log in
  await page
    .getByLabel('Login Name')
    .fill(process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME);
  await page
    .getByLabel('Password', { exact: true })
    .fill(process.env.E2E_PASSWORD_ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('navigation', { name: 'General' })).toBeVisible();
  await expect(
    page.getByText(process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME),
  ).toBeEnabled();
  await expect(
    page.getByRole('navigation', { name: 'breadcrumbs' }).getByText('Orgs'),
  ).toBeVisible();

  // Log out
  await page.getByText(process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME).click();
  await page.getByRole('button', { name: 'Sign Out' }).click();
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();

  await page.reload();

  // Log back in
  await page
    .getByLabel('Login Name')
    .fill(process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME);
  await page
    .getByLabel('Password', { exact: true })
    .fill(process.env.E2E_PASSWORD_ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('navigation', { name: 'General' })).toBeVisible();
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
