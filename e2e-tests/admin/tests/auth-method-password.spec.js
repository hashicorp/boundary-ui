/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../../global-setup.js';
import { expect } from '@playwright/test';
import { execSync } from 'node:child_process';

import * as boundaryCli from '../../helpers/boundary-cli';
import { AuthMethodsPage } from '../pages/auth-methods.js';
import { LoginPage } from '../pages/login.js';
import { OrgsPage } from '../pages/orgs.js';
import { UsersPage } from '../pages/users.js';

// Reset storage state for this file to avoid being authenticated
test.use({ storageState: { cookies: [], origins: [] } });

test.beforeAll(async () => {
  await boundaryCli.checkBoundaryCli();
});

test(
  'Verify new auth-method can be created and assigned to users',
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

      // Create a new password auth method and account
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
      await page.getByText('Choose a different scope').click();
      await page.getByRole('link', { name: orgName }).click();
      await page.getByRole('link', { name: authMethodName }).click();

      await loginPage.login(username, password);
      await expect(
        page
          .getByRole('navigation', { name: 'breadcrumbs' })
          .getByText('Projects'),
      ).toBeVisible();

      // Log back in as admin
      await loginPage.logout(username);
      await loginPage.login(adminLoginName, adminPassword);

      // Set a new password on the account
      await page
        .getByRole('navigation', { name: 'Primary' })
        .getByRole('link', { name: 'Orgs' })
        .click();
      await page.getByRole('link', { name: orgName }).click();
      await expect(
        page
          .getByRole('navigation', { name: 'breadcrumbs' })
          .getByText(orgName),
      ).toBeVisible();
      await page
        .getByRole('navigation', { name: 'Primary' })
        .getByRole('link', { name: 'Auth Methods' })
        .click();
      await page.getByRole('link', { name: authMethodName }).click();
      await page.getByRole('link', { name: 'Accounts', exact: true }).click();
      await page.getByRole('link', { name: username }).click();
      const newPassword = 'new-password';
      await authMethodsPage.setPasswordToAccount(newPassword);

      // Log in using new password
      await loginPage.logout(adminLoginName);

      await page.getByText('Choose a different scope').click();
      await page.getByRole('link', { name: orgName }).click();
      await page.getByRole('link', { name: authMethodName }).click();
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

      // There is an issue with deleting an org that has an auth method unless you
      // delete the auth method first
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
