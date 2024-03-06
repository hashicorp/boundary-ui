/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

/* eslint-disable no-undef */
const { test, expect } = require('@playwright/test');
const { execSync } = require('child_process');
const { checkEnv, authenticatedState } = require('../helpers/general');
const { nanoid } = require('nanoid');

const {
  authenticateBoundaryCli,
  checkBoundaryCli,
  deleteOrgCli,
} = require('../helpers/boundary-cli');
const {
  createNewOrg,
  createRole,
  addPrincipalToRole,
} = require('../helpers/boundary-ui');

test.use({ storageState: authenticatedState });

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
  let org;
  let connect;
  try {
    // Create an org
    const orgName = await createNewOrg(page);
    await authenticateBoundaryCli();
    const orgs = JSON.parse(execSync('boundary scopes list -format json'));
    org = orgs.items.filter((obj) => obj.name == orgName)[0];

    // Navigate to LDAP auth method creation page
    await page
      .getByRole('navigation', { name: 'IAM' })
      .getByRole('link', { name: 'Auth Methods' })
      .click();
    await page.getByRole('button', { name: 'New' }).click();
    await page.getByRole('link', { name: 'LDAP' }).click();

    // Fill out the form
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
    await createRole(page);
    await addPrincipalToRole(page, ldapManagedGroupName);
  } finally {
    if (org) {
      await deleteOrgCli(org.id);
    }
    // End `boundary connect` process
    if (connect) {
      connect.kill('SIGTERM');
    }
  }
});
