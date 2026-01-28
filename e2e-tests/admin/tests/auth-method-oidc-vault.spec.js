/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../../global-setup.js';
import { expect } from '@playwright/test';
import { execSync } from 'child_process';

import * as boundaryCli from '../../helpers/boundary-cli';
import * as vaultCli from '../../helpers/vault-cli';
import { AuthMethodsPage } from '../pages/auth-methods.js';
import { LoginPage } from '../pages/login.js';
import { OrgsPage } from '../pages/orgs.js';
import { RolesPage } from '../pages/roles.js';

// Reset storage state for this file to avoid being authenticated
test.use({ storageState: { cookies: [], origins: [] } });

test.beforeAll(async () => {
  await boundaryCli.checkBoundaryCli();
  await vaultCli.checkVaultCli();
});

test.beforeEach(async () => {
  execSync(`vault auth disable userpass`);
});

test(
  'Set up OIDC auth method',
  { tag: ['@ce', '@ent', '@aws', '@docker'] },
  async ({
    page,
    context,
    controllerAddr,
    adminAuthMethodId,
    adminLoginName,
    adminPassword,
    vaultAddr,
  }) => {
    await page.goto('/');
    let orgName;
    let policyName;
    try {
      const userName = 'end-user';
      const password = 'password123';
      const email = 'vault@hashicorp.com';
      const { issuer, clientId, clientSecret, authPolicyName } =
        await vaultCli.setupVaultOidc(
          vaultAddr,
          userName,
          password,
          email,
          controllerAddr,
        );
      policyName = authPolicyName;

      // Log in
      const loginPage = new LoginPage(page);
      await loginPage.login(adminLoginName, adminPassword);
      await expect(
        page.getByRole('navigation', { name: 'breadcrumbs' }).getByText('Orgs'),
      ).toBeVisible();

      // Create OIDC Auth Method
      const orgsPage = new OrgsPage(page);
      orgName = await orgsPage.createOrg();
      const authMethodsPage = new AuthMethodsPage(page);
      const oidcAuthMethodName = await authMethodsPage.createOidcAuthMethod(
        issuer,
        clientId,
        clientSecret,
        controllerAddr,
      );

      // Change OIDC Auth Method state to active-public
      await page.getByRole('button', { name: 'Inactive' }).click();
      await page.getByText('Public').click();
      await expect(
        page.getByRole('alert').getByText('Success', { exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Dismiss' }).click();

      // Set auth method as primary
      await page.getByText('Manage', { exact: true }).click();
      await page.getByRole('button', { name: 'Make Primary' }).click();
      await page.getByRole('button', { name: 'OK', exact: true }).click();
      await expect(
        page.getByRole('alert').getByText('Success', { exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Dismiss' }).click();

      // Create an OIDC managed group
      await page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(oidcAuthMethodName)
        .click();
      await page.getByText('Manage', { exact: true }).click();
      await page.getByRole('link', { name: 'Create Managed Group' }).click();
      const oidcManagedGroupName = 'OIDC Managed Group';
      await page.getByLabel('Name (Optional)').fill(oidcManagedGroupName);
      await page.getByLabel('Description').fill('This is an automated test');
      await page
        .getByLabel('Filter')
        .fill(`"engineering" in "/userinfo/groups"`);
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(
        page.getByRole('alert').getByText('Success', { exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Dismiss' }).click();

      // Create a role and add LDAP managed group to role
      const rolesPage = new RolesPage(page);
      await rolesPage.createRole();
      await rolesPage.addPrincipalToRole(oidcManagedGroupName);

      // Log in using oidc account
      await loginPage.logout(adminLoginName);
      await page.getByText('Choose a different scope').click();
      await page.getByRole('link', { name: orgName }).click();
      await page.getByRole('link', { name: oidcAuthMethodName }).click();
      const pagePromise = context.waitForEvent('page');
      await page.getByRole('button', { name: 'Sign In' }).click();
      const vaultPage = await pagePromise;
      await vaultPage.getByLabel('Method').selectOption('Username');
      await vaultPage.getByLabel('Username').fill(userName);
      await vaultPage.getByLabel('Password').fill(password);
      await vaultPage.getByRole('button', { name: 'Sign In' }).click();
      await expect(
        page
          .getByRole('navigation', { name: 'breadcrumbs' })
          .getByText('Projects'),
      ).toBeVisible();

      // Log back in as an admin
      await loginPage.logout(email);
      await loginPage.login(adminLoginName, adminPassword);
      await expect(
        page.getByRole('navigation', { name: 'breadcrumbs' }).getByText('Orgs'),
      ).toBeVisible();

      // View the OIDC account and verify account attributes
      await page.getByRole('link', { name: orgName }).click();
      await expect(
        page
          .getByRole('navigation', { name: 'breadcrumbs' })
          .getByText(orgName),
      ).toBeVisible();
      await page
        .getByRole('navigation', { name: 'Application local navigation' })
        .getByRole('link', { name: 'Auth Methods' })
        .click();
      await page.getByRole('link', { name: oidcAuthMethodName }).click();
      await page.getByRole('link', { name: 'Accounts' }).click();
      await expect(
        page
          .getByRole('navigation', { name: 'breadcrumbs' })
          .getByText('Accounts'),
      ).toBeVisible();

      let headersCount = await page
        .getByRole('table')
        .getByRole('columnheader')
        .count();
      let fullNameIndex;
      let emailIndex;
      for (let i = 0; i < headersCount; i++) {
        const header = await page
          .getByRole('table')
          .getByRole('columnheader')
          .nth(i)
          .innerText();
        if (header == 'Full Name') {
          fullNameIndex = i;
        } else if (header == 'Email') {
          emailIndex = i;
        }
      }

      await expect(
        page
          .getByRole('row')
          .filter({ has: page.getByRole('cell', { name: userName }) })
          .getByRole('cell')
          .nth(fullNameIndex),
      ).toHaveText(userName);
      await expect(
        page
          .getByRole('row')
          .filter({ has: page.getByRole('cell', { name: userName }) })
          .getByRole('cell')
          .nth(emailIndex),
      ).toHaveText(email);

      // View the OIDC Managed Group and verify member in managed group
      await page.getByRole('link', { name: 'Managed Groups' }).click();
      await page.getByRole('link', { name: oidcManagedGroupName }).click();
      await page.getByRole('link', { name: 'Members' }).click();
      await expect(
        page
          .getByRole('navigation', { name: 'breadcrumbs' })
          .getByText('Members'),
      ).toBeVisible();

      headersCount = await page
        .getByRole('table')
        .getByRole('columnheader')
        .count();
      for (let i = 0; i < headersCount; i++) {
        const header = await page
          .getByRole('table')
          .getByRole('columnheader')
          .nth(i)
          .innerText();
        if (header == 'Full Name') {
          fullNameIndex = i;
        } else if (header == 'Email') {
          emailIndex = i;
        }
      }

      await expect(
        page
          .getByRole('row')
          .filter({ has: page.getByRole('cell', { name: userName }) })
          .getByRole('cell')
          .nth(fullNameIndex),
      ).toHaveText(userName);
      await expect(
        page
          .getByRole('row')
          .filter({ has: page.getByRole('cell', { name: userName }) })
          .getByRole('cell')
          .nth(emailIndex),
      ).toHaveText(email);

      // View the User account and verify attributes
      await page
        .getByRole('navigation', { name: 'Application local navigation' })
        .getByRole('link', { name: 'Users' })
        .click();
      await page
        .getByRole('cell', { hasText: email })
        .getByRole('link')
        .click();
      await page.getByRole('link', { name: 'Accounts' }).click();
      expect(
        await page
          .getByRole('table')
          .getByRole('row')
          .nth(1) // Account row
          .getByRole('cell')
          .nth(0) // Name field
          .innerText(),
      ).toContain(email);
    } finally {
      execSync(`vault auth disable userpass`);
      execSync(`vault policy delete ${policyName}`);

      if (orgName) {
        await boundaryCli.authenticateBoundary(
          controllerAddr,
          adminAuthMethodId,
          adminLoginName,
          adminPassword,
        );
        const orgId = await boundaryCli.getOrgIdFromName(orgName);
        if (orgId) {
          await boundaryCli.deleteScope(orgId);
        }
      }
    }
  },
);
