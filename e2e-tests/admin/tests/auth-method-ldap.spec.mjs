/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../playwright.config.mjs'
import { expect } from '@playwright/test';
import { nanoid } from 'nanoid';

import {
  authenticateBoundaryCli,
  checkBoundaryCli,
  deleteScopeCli,
  getOrgIdFromNameCli,
} from '../../helpers/boundary-cli.mjs';
import { AuthMethodsPage } from '../pages/auth-methods.mjs';
import { LoginPage } from '../pages/login.mjs';
import { OrgsPage } from '../pages/orgs.mjs';
import { RolesPage } from '../pages/roles.mjs';
import { UsersPage } from '../pages/users.mjs';

test.beforeAll(async () => {
  await checkBoundaryCli();
});

test('Set up LDAP auth method @ce @ent @docker', async ({
  page,
  baseURL,
  adminAuthMethodId,
  adminLoginName,
  adminPassword,
  ldapAddr,
  ldapAdminDn,
  ldapAdminPassword,
  ldapDomainDn,
  ldapGroupName,
  ldapUserName,
  ldapUserPassword,
}) => {
  await page.goto('/');
  let orgName;
  try {
    // Log in
    const loginPage = new LoginPage(page);
    await loginPage.login(adminLoginName, adminPassword);
    await expect(
      page.getByRole('navigation', { name: 'breadcrumbs' }).getByText('Orgs'),
    ).toBeVisible();

    // Create an LDAP auth method
    const orgsPage = new OrgsPage(page);
    orgName = await orgsPage.createOrg();
    await page
      .getByRole('navigation', { name: 'IAM' })
      .getByRole('link', { name: 'Auth Methods' })
      .click();
    await page.getByRole('button', { name: 'New' }).click();
    await page.getByRole('link', { name: 'LDAP' }).click();

    const ldapAuthMethodName = 'LDAP ' + nanoid();
    await page.getByLabel('Name').fill(ldapAuthMethodName);
    await page.getByLabel('Description').fill('LDAP Auth Method');
    await page.getByLabel('Address').fill(ldapAddr);
    await page.getByLabel('Bind DN').fill(ldapAdminDn);
    await page
      .getByLabel('Bind Password')
      .fill(ldapAdminPassword);
    await page.getByRole('switch', { name: 'Discover DN' }).click();
    await page.getByLabel('User DN').fill(ldapDomainDn);
    await page.getByLabel('User Attribute').fill('uid');
    await page.getByLabel('Group DN').fill(ldapDomainDn);
    await page.getByRole('switch', { name: 'Enable Groups' }).click();

    await page
      .getByRole('group', { name: 'Account Attribute Maps' })
      .getByLabel('From Attribute')
      .last()
      .fill('cn');
    await page
      .getByRole('group', { name: 'Account Attribute Maps' })
      .getByLabel('To Attribute')
      .last()
      .selectOption('fullName');
    await page
      .getByRole('group', { name: 'Account Attribute Maps' })
      .getByRole('button', { name: 'Add' })
      .click();
    await page
      .getByRole('group', { name: 'Account Attribute Maps' })
      .getByLabel('From Attribute')
      .last()
      .fill('mail');
    await page
      .getByRole('group', { name: 'Account Attribute Maps' })
      .getByLabel('To Attribute')
      .last()
      .selectOption('email');
    await page
      .getByRole('group', { name: 'Account Attribute Maps' })
      .getByRole('button', { name: 'Add' })
      .click();

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(
      page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss' }).click();

    await expect(
      page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(ldapAuthMethodName),
    ).toBeVisible();

    // Change state to active-public
    page.getByTitle('Inactive').click();
    page.getByText('Public').click();
    await expect(
      page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss' }).click();

    // Create an LDAP account
    const ldapAccountName = 'LDAP Account ' + nanoid();
    await page.getByText('Manage', { exact: true }).click();
    await page.getByRole('link', { name: 'Create Account' }).click();
    await page
      .getByLabel('Name (Optional)', { exact: true })
      .fill(ldapAccountName);
    await page.getByLabel('Description').fill('This is an automated test');
    await page.getByLabel('Login Name').fill(ldapUserName);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(
      page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss' }).click();

    // Create an LDAP managed group
    await page
      .getByRole('navigation', { name: 'breadcrumbs' })
      .getByText(ldapAuthMethodName)
      .click();
    await page.getByText('Manage', { exact: true }).click();
    await page.getByRole('link', { name: 'Create Managed Group' }).click();
    const ldapManagedGroupName = 'LDAP Managed Group ' + nanoid();
    await page.getByLabel('Name (Optional)').fill(ldapManagedGroupName);
    await page.getByLabel('Description').fill('This is an automated test');
    await page
      .getByRole('textbox', { name: 'Value' })
      .fill(ldapGroupName);
    await page.getByRole('button', { name: 'Add' }).click();

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(
      page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss' }).click();

    // Create a role and add LDAP managed group to role
    const rolesPage = new RolesPage(page);
    await rolesPage.createRole();
    await rolesPage.addPrincipalToRole(ldapManagedGroupName);

    // Create a user and attach LDAP account to it
    const usersPage = new UsersPage(page);
    const userName = await usersPage.createUser();
    await usersPage.addAccountToUser(ldapUserName);

    // Create a second auth method so that there's multiple auth methods on the
    // login screen
    const authMethodsPage = new AuthMethodsPage(page);
    await authMethodsPage.createPasswordAuthMethod();

    // Log in using ldap account
    await loginPage.logout(adminLoginName);

    await page.getByText('Choose a different scope').click();
    await page.getByRole('link', { name: orgName }).click();
    await page.getByRole('link', { name: ldapAuthMethodName }).click();
    await loginPage.login(ldapUserName, ldapUserPassword);
    await expect(
      page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText('Projects'),
    ).toBeVisible();

    // Log back in as an admin
    await loginPage.logout(ldapUserName);
    await loginPage.login(adminLoginName, adminPassword);
    await expect(
      page.getByRole('navigation', { name: 'breadcrumbs' }).getByText('Orgs'),
    ).toBeVisible();

    // View the LDAP account and verify account attributes
    await page.getByRole('link', { name: orgName }).click();
    await page
      .getByRole('navigation', { name: 'IAM' })
      .getByRole('link', { name: 'Auth Methods' })
      .click();
    await page.getByRole('link', { name: ldapAuthMethodName }).click();
    await page.getByRole('link', { name: 'Accounts' }).click();

    const headersCount = await page
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

    expect(
      await page
        .getByRole('cell', { name: ldapAccountName })
        .locator('..')
        .getByRole('cell')
        .nth(fullNameIndex)
        .innerText(),
    ).toBe(ldapUserName);
    expect(
      await page
        .getByRole('cell', { name: ldapAccountName })
        .locator('..')
        .getByRole('cell')
        .nth(emailIndex)
        .innerText(),
    ).toBe(ldapUserName + '@mail.com');

    // View the User account and verify attributes
    await page
      .getByRole('navigation', { name: 'IAM' })
      .getByRole('link', { name: 'Users' })
      .click();
    await page.getByRole('link', { name: userName }).click();
    await page.getByRole('link', { name: 'Accounts' }).click();
    expect(
      await page
        .getByRole('table')
        .getByRole('row')
        .nth(1) // Account row
        .getByRole('cell')
        .nth(0) // Name field
        .innerText(),
    ).toContain(ldapUserName + '@mail.com');
  } finally {
    if (orgName) {
      await authenticateBoundaryCli(
        baseURL,
        adminAuthMethodId,
        adminLoginName,
        adminPassword,
      );
      const orgId = await getOrgIdFromNameCli(orgName);
      if (orgId) {
        await deleteScopeCli(orgId);
      }
    }
  }
});
