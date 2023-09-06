/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

/* eslint-disable no-undef */
const { expect } = require('@playwright/test');
const { nanoid } = require('nanoid');

/**
 * Uses the UI to create a new organization
 * @param {Page} page Playwright page object
 * @returns Name of the organization
 */
exports.createNewOrg = async (page) => {
  const orgName = 'Org ' + nanoid();
  await page
    .getByRole('navigation', { name: 'General' })
    .getByRole('link', { name: 'Orgs' })
    .click();
  await page.getByRole('link', { name: 'New Org' }).click();
  await page.getByLabel('Name').fill(orgName);
  await page.getByLabel('Description').fill('This is an automated test');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page
      .getByRole('navigation', { name: 'breadcrumbs' })
      .getByRole('link', { name: orgName })
  ).toBeVisible();

  return orgName;
};

/**
 * Uses the UI to create a new project. Assumes you have selected the desired org.
 * @param {Page} page Playwright page object
 * @returns Name of the project
 */
exports.createNewProject = async (page) => {
  const projectName = 'Project ' + nanoid();
  await page
    .getByRole('navigation', { name: 'General' })
    .getByRole('link', { name: 'Projects' })
    .click();
  await page.getByRole('link', { name: 'New' }).click();
  await page.getByLabel('Name').fill(projectName);
  await page.getByLabel('Description').fill('This is an automated test');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page
      .getByRole('navigation', { name: 'breadcrumbs' })
      .getByRole('link', { name: projectName })
  ).toBeVisible();

  return projectName;
};

/**
 * Uses the UI to create a new host catalog. Assumes you have selected the desired project.
 * @param {Page} page Playwright page object
 * @returns Name of the host catalog
 */
exports.createNewHostCatalog = async (page) => {
  const hostCatalogName = 'Host Catalog ' + nanoid();
  await page
    .getByRole('navigation', { name: 'Resources' })
    .getByRole('link', { name: 'Host Catalogs' })
    .click();
  await page.getByRole('link', { name: 'New' }).click();
  await page.getByLabel('Name').fill(hostCatalogName);
  await page.getByLabel('Description').fill('This is an automated test');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page
      .getByRole('navigation', { name: 'breadcrumbs' })
      .getByRole('link', { name: hostCatalogName })
  ).toBeVisible();

  return hostCatalogName;
};

/**
 * Uses the UI to create a new host set. Assumes you have just created a new host catalog.
 * @param {Page} page Playwright page object
 * @returns Name of the host set
 */
exports.createNewHostSet = async (page) => {
  const hostSetName = 'Host Set ' + nanoid();
  await page.getByRole('link', { name: 'Host Sets' }).click();
  await page.getByRole('link', { name: 'New', exact: true }).click();
  await page.getByLabel('Name').fill(hostSetName);
  await page.getByLabel('Description').fill('This is an automated test');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page
      .getByRole('navigation', { name: 'breadcrumbs' })
      .getByRole('link', { name: hostSetName })
  ).toBeVisible();

  return hostSetName;
};

/**
 * Uses the UI to create a new host in a host set. Assumes you have just created a new host set.
 * @param {Page} page Playwright page object
 * @returns Name of the host
 */
exports.createNewHostInHostSet = async (page) => {
  const hostName = 'Host ' + nanoid();
  await page.getByText('Manage').click();
  await page.getByRole('link', { name: 'Create and Add Host' }).click();
  await page.getByLabel('Name').fill(hostName);
  await page.getByLabel('Description').fill('This is an automated test');
  await page.getByLabel('Address').fill(process.env.E2E_TARGET_ADDRESS);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(page.getByRole('link', { name: hostName })).toBeVisible();

  return hostName;
};

/**
 * Uses the UI to create a new target. Assumes you have selected the desired project.
 * @param {Page} page Playwright page object
 * @returns Name of the target
 */
exports.createNewTarget = async (page) => {
  const targetName = 'Target ' + nanoid();
  await page
    .getByRole('navigation', { name: 'Resources' })
    .getByRole('link', { name: 'Targets' })
    .click();
  await page.getByRole('link', { name: 'New' }).click();
  await page.getByLabel('Name').fill(targetName);
  await page.getByLabel('Description').fill('This is an automated test');
  await page.getByLabel('Default Port').fill(process.env.E2E_TARGET_PORT);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page
      .getByRole('navigation', { name: 'breadcrumbs' })
      .getByRole('link', { name: targetName })
  ).toBeVisible();

  return targetName;
};

/**
 * Uses the UI to create a new target with address. Assumes you have selected the desired project.
 * @param {Page} page Playwright page object
 * @returns Name of the target
 */
exports.createNewTargetWithAddress = async (page) => {
  const targetName = 'Target ' + nanoid();
  await page
    .getByRole('navigation', { name: 'Resources' })
    .getByRole('link', { name: 'Targets' })
    .click();
  await page.getByRole('link', { name: 'New' }).click();
  await page.getByLabel('Name').fill(targetName);
  await page.getByLabel('Description').fill('This is an automated test');
  await page.getByLabel('Target Address').fill(process.env.E2E_TARGET_ADDRESS);
  await page.getByLabel('Default Port').fill(process.env.E2E_TARGET_PORT);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page
      .getByRole('navigation', { name: 'breadcrumbs' })
      .getByRole('link', { name: targetName })
  ).toBeVisible();

  return targetName;
};

/**
 * Uses the UI to add a host source to a target. Assume you have selected the desired target.
 * @param {Page} page Playwright page object
 * @param {string} hostSourceName Name of host source that will be attached to the target
 */
exports.addHostSourceToTarget = async (page, hostSourceName) => {
  await page.getByRole('link', { name: 'Host Sources', exact: true }).click();
  await page
    .getByRole('article')
    .getByRole('link', { name: 'Add Host Sources', exact: true })
    .click();
  await page
    .getByRole('cell', { name: hostSourceName })
    .locator('..')
    .getByRole('checkbox')
    .click({ force: true });
  await page.getByRole('button', { name: 'Add Host Sources' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(page.getByRole('link', { name: hostSourceName })).toBeVisible();
};

/**
 * Uses the UI to navigate to Sessions and waits for the session to appear.
 * @param {Page} page Playwright page object
 * @param {string} targetName Name of the target associated with the session
 */
exports.waitForSessionToBeVisible = async (page, targetName) => {
  await page
    .getByRole('navigation', { name: 'Resources' })
    .getByRole('link', { name: 'Sessions' })
    .click();
  let i = 0;
  let sessionIsVisible = false;
  do {
    i = i + 1;
    sessionIsVisible = await page
      .getByRole('cell', { name: targetName })
      .isVisible();
    if (sessionIsVisible) {
      break;
    }
    await page.getByRole('button', { name: 'Refresh' }).click();
    await expect(page.getByRole('button', { name: 'Refresh' })).toBeEnabled();
  } while (i < 5);

  if (!sessionIsVisible) {
    throw new Error('Session is not visible');
  }
};

/**
 * Uses the UI to navigate to the specified Target and add the Brokered Credentials to it.
 * @param {Page} page Playwright page object
 * @param {string} targetName Name of the target associated with the session
 * @param {string} credentialName Name of the credentials to be added to the target
 */
exports.addBrokeredCredentialsToTarget = async (
  page,
  targetName,
  credentialName
) => {
  await page
    .getByRole('navigation', { name: 'Resources' })
    .getByRole('link', { name: 'Targets' })
    .click();
  await page.getByRole('link', { name: targetName }).click();
  await page
    .getByRole('link', { name: 'Brokered Credentials', exact: true })
    .click();
  await page
    .getByRole('article')
    .getByRole('link', { name: 'Add Brokered Credentials', exact: true })
    .click();
  await page
    .getByRole('cell', { name: credentialName })
    .locator('..')
    .getByRole('checkbox')
    .click({ force: true });
  await page
    .getByRole('button', { name: 'Add Brokered Credentials', exact: true })
    .click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(page.getByRole('link', { name: credentialName })).toBeVisible();
};

/**
 * Uses the UI to create new Auth Method. Assumes you have selected the desired scope.
 * @param {Page} page Playwright page object
 * @param {string} authMethodName Name of new auth method
 */
exports.createNewPasswordAuthMethod = async (page, authMethodName) => {
  await page
    .getByRole('navigation', { name: 'IAM' })
    .getByRole('link', { name: 'Auth Methods' })
    .click();
  await page.getByTitle('New', { exact: true }).click();
  await page.getByText('Password', { exact: true }).click();
  await page.getByLabel('Name').fill(authMethodName);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page
      .getByRole('navigation', { name: 'breadcrumbs' })
      .getByRole('link', { name: authMethodName })
  ).toBeVisible();
};

/**
 * Uses the UI to make the first available auth method primary.
 * Assumes you have created new auth method.
 * @param {Page} page Playwright page object
 */
exports.makeAuthMethodPrimary = async (page) => {
  await page
    .getByRole('navigation', { name: 'IAM' })
    .getByRole('link', { name: 'Auth Methods' })
    .click();
  await page.getByRole('button', { name: 'Manage' }).click();
  await page.getByText('Make Primary', { exact: true }).click();
  await page.getByText('OK', { exact: true }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
};

/**
 * Uses the UI to create new Account. Assumes you have selected the desired Auth Method
 * which the account will be created for.
 * @param {Page} page Playwright page object
 * @param {string} accountName Name of new account
 * @param {string} login Login of new account
 * @param {string} password Password of new account
 */
exports.addAccountToAuthMethod = async (page, accountName, login, password) => {
  await page.getByRole('link', { name: 'Accounts' }).click();
  await page
    .getByRole('article')
    .getByRole('link', { name: 'Create Account', exact: true })
    .click();
  await page.getByLabel('Name', { exact: true }).fill(accountName);
  await page.getByLabel('Login Name').fill(login);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page
      .getByRole('navigation', { name: 'breadcrumbs' })
      .getByRole('link', { name: accountName })
  ).toBeVisible();
};

/**
 * Uses the UI to set a new password to an account.
 * Assumes you have selected the desired Account.
 * @param {Page} page Playwright page object
 * @param {string} password New password of the account
 */
exports.setPasswordToAccount = async (page, password) => {
  await page.getByRole('link', { name: 'Set Password' }).click();
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
};

/**
 * Uses the UI to create a new user.
 * @param {Page} page Playwright page object
 * @param {string} userName Name of new user
 */
exports.createNewUser = async (page, userName) => {
  await page
    .getByRole('navigation', { name: 'IAM' })
    .getByRole('link', { name: 'Users' })
    .click();
  await page
    .getByRole('article')
    .getByRole('link', { name: 'New', exact: true })
    .click();
  await page.getByLabel('Name').fill(userName);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page
      .getByRole('navigation', { name: 'breadcrumbs' })
      .getByRole('link', { name: userName })
  ).toBeVisible();
};

/**
 * Uses the UI to add the first available account to a user.
 * Assumes you have selected the desired user.
 * Assumes you have created new account.
 * @param {Page} page Playwright page object
 */
exports.addAccountToUser = async (page) => {
  await page.getByRole('link', { name: 'Accounts', exact: true }).click();
  await page
    .getByRole('article')
    .getByRole('link', { name: 'Add Accounts', exact: true })
    .click();

  await page.getByRole('checkbox').click();
  await page.getByRole('button', { name: 'Add Accounts', exact: true }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
};

/**
 * Uses the UI to create a new group. Assumes you have selected the desired scope.
 * @param {Page} page Playwright page object
 * @param {string} groupName Name of the new group
 */
exports.createNewGroup = async (page, groupName) => {
  await page
    .getByRole('navigation', { name: 'IAM' })
    .getByRole('link', { name: 'Groups' })
    .click();
  await page
    .getByRole('article')
    .getByRole('link', { name: 'New', exact: true })
    .click();
  await page.getByLabel('Name').fill(groupName);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page
      .getByRole('navigation', { name: 'breadcrumbs' })
      .getByRole('link', { name: groupName })
  ).toBeVisible();
};

/**
 * Uses the UI to add a user to the group. Assumes you have selected the desired group.
 * @param {Page} page Playwright page object
 * @param {string} userName Name of the user that will be added to the group
 */
exports.addMemberToGroup = async (page, userName) => {
  await page.getByRole('link', { name: 'Members', exact: true }).click();
  await page
    .getByRole('article')
    .getByRole('link', { name: 'Add Members', exact: true })
    .click();
  await page.getByRole('checkbox', { name: userName }).click();
  await page.getByRole('button', { name: 'Add Members', exact: true }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(page.getByRole('table').getByText(userName)).toBeVisible();
};

/**
 * Uses the UI to create a new role. Assumes you have selected the desired scope.
 * @param {Page} page Playwright page object
 * @param {string} roleName Name of the new role
 */
exports.createNewRole = async (page, roleName) => {
  await page
    .getByRole('navigation', { name: 'IAM' })
    .getByRole('link', { name: 'Roles' })
    .click();
  await page.getByRole('link', { name: 'New Role' }).click();
  await page.getByLabel('Name').fill(roleName);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page
      .getByRole('navigation', { name: 'breadcrumbs' })
      .getByRole('link', { name: roleName })
  ).toBeVisible();
};

/**
 * Uses the UI to add a principal to the role. Assumes you have selected the desired role.
 * @param {Page} page Playwright page object
 * @param {string} principalName Name of the principal that will be added to the role
 */
exports.addPrincipalToRole = async (page, principalName) => {
  await page.getByRole('link', { name: 'Principals', exact: true }).click();
  await page
    .getByRole('article')
    .getByRole('link', { name: 'Add Principals', exact: true })
    .click();
  await page.getByRole('checkbox', { name: principalName }).click();
  await page
    .getByRole('button', { name: 'Add Principals', exact: true })
    .click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page.getByRole('table').getByRole('link', { name: principalName })
  ).toBeVisible();
};

/**
 * Uses the UI to add a grant to the role. Assumes you have selected the desired role.
 * @param {Page} page Playwright page object
 * @param {string} grants grants that will be given to the role
 */
exports.addGrantsToGroup = async (page, grants) => {
  await page.getByRole('link', { name: 'Grants', exact: true }).click();
  await page.getByRole('textbox', { name: 'New Grant' }).fill(grants);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page.getByRole('textbox', { name: 'Grant', exact: true })
  ).toHaveValue(grants);
};
