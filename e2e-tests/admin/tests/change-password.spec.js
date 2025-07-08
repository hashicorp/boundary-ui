/**
 * Copyright (c) HashiCorp, Inc.
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
  async ({ page, request, adminLoginName, adminPassword }) => {
    await page.goto('/');

    let org;
    let authMethod;
    let account;
    let user;
    try {
      // Log in
      const loginPage = new LoginPage(page);
      await loginPage.login(adminLoginName, adminPassword);
      await expect(
        page.getByRole('navigation', { name: 'breadcrumbs' }).getByText('Orgs'),
      ).toBeVisible();

      // Create a new org, password auth method, account, and user via http API
      org = await boundaryHttp.createOrg(request);

      authMethod = await boundaryHttp.createPasswordAuthMethod(request, org.id);
      const username = 'test-user';
      const password = 'password';
      account = await boundaryHttp.createPasswordAccount(
        request,
        authMethod.id,
        username,
        password,
      );
      await boundaryHttp.makeAuthMethodPrimary(request, org.id, authMethod.id);

      user = await boundaryHttp.createUser(request, org.id);
      await boundaryHttp.addAccountToUser(request, user.id, account.id);

      // Log in using new account
      await loginPage.logout(adminLoginName);
      await page.getByText('Choose a different scope').click();
      await page.getByRole('link', { name: org.name }).click();
      await page.getByRole('link', { name: authMethod.name }).click();

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
      await expect(page.getByText(adminLoginName)).toBeHidden();

      // Confirm user can log in with new password
      await loginPage.login(username, newPassword);
      await expect(
        page
          .getByRole('navigation', { name: 'breadcrumbs' })
          .getByText('Projects'),
      ).toBeVisible();
    } finally {
      if (authMethod.id) {
        await request.delete(`/v1/auth-methods/${authMethod.id}`);
      }
      if (org.id) {
        org = await request.delete(`/v1/scopes/${org.id}`);
      }
    }
  },
);
