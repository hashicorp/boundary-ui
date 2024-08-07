/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

const { test, expect } = require('@playwright/test');
const { nanoid } = require('nanoid');

const { checkEnv } = require('../helpers/general');
const {
  authenticateBoundaryCli,
  checkBoundaryCli,
  deleteScopeCli,
  getOrgIdFromNameCli,
} = require('../helpers/boundary-cli');
const AuthMethodsPage = require('../pages/auth-methods');
const OrgsPage = require('../pages/orgs');
const RolesPage = require('../pages/roles');
const UsersPage = require('../pages/users');

test.beforeAll(async () => {
  await checkEnv([
    'E2E_LDAP_ADDR',
    'E2E_LDAP_DOMAIN_DN',
    'E2E_LDAP_ADMIN_DN',
    'E2E_LDAP_ADMIN_PASSWORD',
    'E2E_LDAP_USER_NAME',
    'E2E_LDAP_USER_PASSWORD',
    'E2E_LDAP_GROUP_NAME',
  ]);

  await checkBoundaryCli();
});

test('Set up LDAP auth method @ce @ent @docker', async ({ page }) => {
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
    await page.getByLabel('Address').fill(process.env.E2E_LDAP_ADDR);
    await page.getByLabel('Bind DN').fill(process.env.E2E_LDAP_ADMIN_DN);
    await page
      .getByLabel('Bind Password')
      .fill(process.env.E2E_LDAP_ADMIN_PASSWORD);
    await page.getByRole('switch', { name: 'Discover DN' }).click();
    await page.getByLabel('User DN').fill(process.env.E2E_LDAP_DOMAIN_DN);
    await page.getByLabel('User Attribute').fill('uid');
    await page.getByLabel('Group DN').fill(process.env.E2E_LDAP_DOMAIN_DN);
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
    await page.getByLabel('Login Name').fill(process.env.E2E_LDAP_USER_NAME);
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
      .fill(process.env.E2E_LDAP_GROUP_NAME);
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
    await usersPage.addAccountToUser(process.env.E2E_LDAP_USER_NAME);

    // Create a second auth method so that there's multiple auth methods on the
    // login screen
    const authMethodsPage = new AuthMethodsPage(page);
    await authMethodsPage.createPasswordAuthMethod();

    // Log out
    await page.getByText(process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME).click();
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();

    // Log in using ldap account
    await page.getByText('Choose a different scope').click();
    await page.getByRole('link', { name: orgName }).click();
    await page.getByRole('link', { name: ldapAuthMethodName }).click();
    await page.getByLabel('Login Name').fill(process.env.E2E_LDAP_USER_NAME);
    await page
      .getByLabel('Password', { exact: true })
      .fill(process.env.E2E_LDAP_USER_PASSWORD);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(
      page.getByRole('navigation', { name: 'General' }),
    ).toBeVisible();
    await expect(page.getByText(process.env.E2E_LDAP_USER_NAME)).toBeEnabled();
    await expect(
      page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText('Projects'),
    ).toBeVisible();

    // Log out
    await page.getByText(process.env.E2E_LDAP_USER_NAME).click();
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();

    // Log back in as an admin
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
    ).toBe(process.env.E2E_LDAP_USER_NAME);
    expect(
      await page
        .getByRole('cell', { name: ldapAccountName })
        .locator('..')
        .getByRole('cell')
        .nth(emailIndex)
        .innerText(),
    ).toBe(process.env.E2E_LDAP_USER_NAME + '@mail.com');

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
    ).toContain(process.env.E2E_LDAP_USER_NAME + '@mail.com');
  } finally {
    if (orgName) {
      await authenticateBoundaryCli(
        process.env.BOUNDARY_ADDR,
        process.env.E2E_PASSWORD_AUTH_METHOD_ID,
        process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
        process.env.E2E_PASSWORD_ADMIN_PASSWORD,
      );
      const orgId = await getOrgIdFromNameCli(orgName);
      if (orgId) {
        await deleteScopeCli(orgId);
      }
    }
  }
});
