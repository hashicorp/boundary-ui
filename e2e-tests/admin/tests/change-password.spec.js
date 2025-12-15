/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../../global-setup.js';
import { expect } from '@playwright/test';

import * as boundaryCli from '../../helpers/boundary-cli';
import * as boundaryHttp from '../../helpers/boundary-http.js';
import { LoginPage } from '../pages/login.js';

// Reset storage state for this file to avoid being authenticated
test.use({ storageState: { cookies: [], origins: [] } });

test.beforeAll(async () => {
  await boundaryCli.checkBoundaryCli();
});

test(
  'Verify user can change password',
  { tag: ['@ce', '@ent', '@aws', '@docker'] },
  async ({ page, request }) => {
    await page.goto('/');
    let org;
    let authMethod;
    try {
      let account;
      let user;

      // Create a new org, password auth method, account, and user via http API
      org = await boundaryHttp.createOrg(request);

      authMethod = await boundaryHttp.createPasswordAuthMethod(request, org.id);
      const username = 'test-user';
      const password = 'password';
      account = await boundaryHttp.createPasswordAccount(request, {
        authMethodId: authMethod.id,
        username,
        password,
      });
      await boundaryHttp.makeAuthMethodPrimary(request, {
        org,
        authMethodId: authMethod.id,
      });

      user = await boundaryHttp.createUser(request, org.id);
      await boundaryHttp.addAccountsToUser(request, {
        user,
        accountIds: [account.id],
      });

      // Log in using new account
      await page.reload();
      await page.getByText('Choose a different scope').click();
      await page.getByRole('link', { name: org.name }).click();
      await page.getByRole('link', { name: authMethod.name }).click();
      const loginPage = new LoginPage(page);
      await loginPage.login(username, password);
      await expect(
        page
          .getByRole('navigation', { name: 'breadcrumbs' })
          .getByText('Projects'),
      ).toBeVisible();

      // Change password for user
      await page.getByRole('button', { name: username }).click();
      await page.getByRole('link', { name: 'Change Password' }).click();
      const newPassword = 'new-password';
      await page.getByLabel('Current Password').fill(password);
      await page.getByLabel('New Password').fill(newPassword);
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(
        page.getByRole('alert').getByText('Success', { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole('heading', { name: 'Projects' }),
      ).toBeVisible();

      // Confirm user cannot log in with old password
      await loginPage.logout(username);
      await page.getByText('Choose a different scope').click();
      await page.getByRole('link', { name: org.name }).click();
      await page.getByRole('link', { name: authMethod.name }).click();
      await page.getByLabel('Login Name').fill(username);
      await page.getByLabel('Password', { exact: true }).fill(password);
      await page.getByRole('button', { name: 'Sign In' }).click();
      await expect(page.getByRole('alert').getByText('Error')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();

      // Confirm user can log in with new password
      await loginPage.login(username, newPassword);
      await expect(
        page
          .getByRole('navigation', { name: 'breadcrumbs' })
          .getByText('Projects'),
      ).toBeVisible();
    } finally {
      if (authMethod.id) {
        await boundaryHttp.deleteAuthMethod(request, authMethod.id);
      }
      if (org.id) {
        await boundaryHttp.deleteOrg(request, org.id);
      }
    }
  },
);
