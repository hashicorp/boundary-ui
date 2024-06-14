/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

/* eslint-disable no-undef */
const { test, expect } = require('@playwright/test');
const { execSync } = require('child_process');
const {
  authenticateBoundaryCli,
  checkBoundaryCli,
  deleteOrgCli,
} = require('../helpers/boundary-cli');
const {
  createOrg,
  createPasswordAuthMethod,
  createPasswordAccount,
  setPasswordToAccount,
  createUser,
  addAccountToUser,
  makeAuthMethodPrimary,
} = require('../helpers/boundary-ui');

test.beforeAll(async () => {
  await checkBoundaryCli();
});

test('Verify new auth-method can be created and assigned to users @ce @ent @aws @docker', async ({
  page,
}) => {
  await page.goto('/');
  let orgName;
  try {
    // Log in
    await page
      .getByLabel('Login Name')
      .fill(process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME);
    await page
      .getByLabel('Password', { exact: true })
      .fill(process.env.E2E_PASSWORD_ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(
      page.getByRole('navigation', { name: 'General' }),
    ).toBeVisible();
    await expect(
      page.getByText(process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME),
    ).toBeEnabled();
    await expect(
      page.getByRole('navigation', { name: 'breadcrumbs' }).getByText('Orgs'),
    ).toBeVisible();

    // Create a new password auth method and account
    orgName = await createOrg(page);
    const authMethodName = await createPasswordAuthMethod(page);
    const username = 'test-user';
    const password = 'password';
    await createPasswordAccount(page, username, password);
    await makeAuthMethodPrimary(page);
    await createUser(page);
    await addAccountToUser(page, username);

    // Log out
    await page.getByText(process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME).click();
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();

    // Log in using new account
    await page.getByText('Choose a different scope').click();
    await page.getByRole('link', { name: orgName }).click();
    await page.getByRole('link', { name: authMethodName }).click();
    await page.getByLabel('Login Name').fill(username);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(
      page.getByRole('navigation', { name: 'General' }),
    ).toBeVisible();
    await expect(page.getByText(username)).toBeEnabled();
    await expect(
      page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText('Projects'),
    ).toBeVisible();

    // Log out
    await page.getByText(username).click();
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();

    // Log back in as admin
    await page
      .getByLabel('Login Name')
      .fill(process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME);
    await page
      .getByLabel('Password', { exact: true })
      .fill(process.env.E2E_PASSWORD_ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Set a new password on the account
    await page
      .getByRole('navigation', { name: 'General' })
      .getByRole('link', { name: 'Orgs' })
      .click();
    await page.getByRole('link', { name: orgName }).click();
    await expect(
      page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByRole('link', { name: orgName }),
    ).toBeVisible();
    await page
      .getByRole('navigation', { name: 'IAM' })
      .getByRole('link', { name: 'Auth Methods' })
      .click();
    await page.getByRole('link', { name: authMethodName }).click();
    await page.getByRole('link', { name: 'Accounts', exact: true }).click();
    await page.getByRole('link', { name: username }).click();
    const newPassword = 'new-password';
    await setPasswordToAccount(page, newPassword);

    // Log out
    await page.getByText(process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME).click();
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();

    // Log in using new password
    await page.getByText('Choose a different scope').click();
    await page.getByRole('link', { name: orgName }).click();
    await page.getByRole('link', { name: authMethodName }).click();
    await page.getByLabel('Login Name').fill(username);
    await page.getByLabel('Password', { exact: true }).fill(newPassword);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(
      page.getByRole('navigation', { name: 'General' }),
    ).toBeVisible();
    await expect(page.getByText(username)).toBeEnabled();
    await expect(
      page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText('Projects'),
    ).toBeVisible();
  } finally {
    await authenticateBoundaryCli(
      process.env.BOUNDARY_ADDR,
      process.env.E2E_PASSWORD_AUTH_METHOD_ID,
      process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
      process.env.E2E_PASSWORD_ADMIN_PASSWORD,
    );
    const orgs = JSON.parse(execSync('boundary scopes list -format json'));
    const org = orgs.items.filter((obj) => obj.name == orgName)[0];
    if (org) {
      await deleteOrgCli(org.id);
    }
  }
});
