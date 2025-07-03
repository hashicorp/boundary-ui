/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../../global-setup.js';
import { expect } from '@playwright/test';
import { execSync } from 'child_process';

import * as boundaryCli from '../../helpers/boundary-cli';
import { LoginPage } from '../pages/login.js';
import { OrgsPage } from '../pages/orgs.js';
import { AuthMethodsPage } from '../pages/auth-methods.js';
import { UsersPage } from '../pages/users.js';

// Reset storage state for this file to avoid being authenticated
test.use({ storageState: { cookies: [], origins: [] } });

test.beforeAll(async () => {
  await boundaryCli.checkBoundaryCli();
});

test(
  'Verify user can change password',
  // TODO: check test works for each tag
  { tag: ['@ce', '@ent', '@aws', '@docker'] },
  async ({
    page,
    controllerAddr,
    adminAuthMethodId,
    adminLoginName,
    adminPassword,
  }) => {
    await page.goto('/');
    let orgName;
    let authMethodName;
    try {
      // Log in
      const loginPage = new LoginPage(page);
      await loginPage.login(adminLoginName, adminPassword);
      await expect(
        page.getByRole('navigation', { name: 'breadcrumbs' }).getByText('Orgs'),
      ).toBeVisible();

      // Create a new org, password auth method, account, and user
      const orgsPage = new OrgsPage(page);
      orgName = await orgsPage.createOrg();

      const authMethodsPage = new AuthMethodsPage(page);
      authMethodName = await authMethodsPage.createPasswordAuthMethod();
      const username = 'test-user';
      const password = 'password';
      await authMethodsPage.createPasswordAccount(username, password);
      await authMethodsPage.makeAuthMethodPrimary();

      const usersPage = new UsersPage(page);
      await usersPage.createUser();
      await usersPage.addAccountToUser(username);

      // Log in using new account
      await loginPage.logout(adminLoginName);
      await console.log(`Logging in as ${username} with password ${password}`);
      await page.getByText('Choose a different scope').click();
      await page.getByRole('link', { name: orgName }).click();
      await page.getByRole('link', { name: authMethodName }).click();

      await loginPage.login(username, password);
      await expect(
        page
          .getByRole('navigation', { name: 'breadcrumbs' })
          .getByText('Projects'),
      ).toBeVisible();

      // Change password for user
      // TODO: move to auth-methods.js page?
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
      await page.getByRole('link', { name: orgName }).click();
      await page.getByRole('link', { name: authMethodName }).click();
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
      await boundaryCli.authenticateBoundary(
        controllerAddr,
        adminAuthMethodId,
        adminLoginName,
        adminPassword,
      );

      if (authMethodName) {
        const authMethods = JSON.parse(
          execSync('boundary auth-methods list --recursive -format json'),
        );
        const authMethod = authMethods.items.filter(
          (obj) => obj.name == authMethodName,
        )[0];
        if (authMethod) {
          try {
            execSync('boundary auth-methods delete -id=' + authMethod.id);
          } catch (e) {
            console.log(`${e.stderr}`);
          }
        }
      }

      if (orgName) {
        const orgId = await boundaryCli.getOrgIdFromName(orgName);
        if (orgId) {
          await boundaryCli.deleteScope(orgId);
        }
      }
    }
  },
);
