/* eslint-disable no-undef */
const { test, expect } = require('@playwright/test');

test('Log in, log out, and then log back in', async ({ page }) => {
  await page.goto('/');

  await page
    .getByLabel('Login Name')
    .fill(process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME);
  await page
    .getByLabel('Password')
    .fill(process.env.E2E_PASSWORD_ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('navigation', { name: 'General' })).toBeVisible();
  await expect(
    page.getByText(process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME)
  ).toBeEnabled();

  await page.getByText(process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME).click();
  await page.getByRole('button', { name: 'Sign Out' }).click();
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();

  await page.reload();

  await page
    .getByLabel('Login Name')
    .fill(process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME);
  await page
    .getByLabel('Password')
    .fill(process.env.E2E_PASSWORD_ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('navigation', { name: 'General' })).toBeVisible();
});

test.describe('Failure Cases', async () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Log in with invalid password', async ({ page }) => {
    await page
      .getByLabel('Login Name')
      .fill(process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME);
    await page.getByLabel('Password').fill('badpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole('alert').getByText('Error')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(
      page.getByText(process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME)
    ).toBeHidden();
  });

  test('Log in with only username', async ({ page }) => {
    await page.getByLabel('Login Name').fill('testuser');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole('alert').getByText('Error')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(
      page.getByText(process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME)
    ).toBeHidden();
  });

  test('Log in with only password', async ({ page }) => {
    await page
      .getByLabel('Password')
      .fill(process.env.E2E_PASSWORD_ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole('alert').getByText('Error')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(
      page.getByText(process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME)
    ).toBeHidden();
  });
});
