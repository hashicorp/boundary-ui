/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

/* eslint-disable no-undef */
const { expect } = require('@playwright/test');
const { readFile } = require('fs/promises');
const { nanoid } = require('nanoid');

/**
 * Uses the UI to create a new organization
 * @param {Page} page Playwright page object
 * @returns Name of the organization
 */
exports.createOrg = async (page) => {
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
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page.getByRole('navigation', { name: 'breadcrumbs' }).getByText(orgName),
  ).toBeVisible();

  return orgName;
};

/**
 * Uses the UI to create a new project. Assumes you have selected the desired org.
 * @param {Page} page Playwright page object
 * @returns Name of the project
 */
exports.createProject = async (page) => {
  const projectName = 'Project ' + nanoid();
  await page
    .getByRole('navigation', { name: 'General' })
    .getByRole('link', { name: 'Projects' })
    .click();
  await page.getByRole('link', { name: 'New', exact: true }).click();
  await page.getByLabel('Name').fill(projectName);
  await page.getByLabel('Description').fill('This is an automated test');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page
      .getByRole('navigation', { name: 'breadcrumbs' })
      .getByText(projectName),
  ).toBeVisible();

  return projectName;
};

/**
 * Uses the UI to create a new host catalog. Assumes you have selected the desired project.
 * @param {Page} page Playwright page object
 * @returns Name of the host catalog
 */
exports.createHostCatalog = async (page) => {
  const hostCatalogName = 'Host Catalog ' + nanoid();
  await page
    .getByRole('navigation', { name: 'Resources' })
    .getByRole('link', { name: 'Host Catalogs' })
    .click();
  await page.getByRole('link', { name: 'New', exact: true }).click();
  await page.getByLabel('Name').fill(hostCatalogName);
  await page.getByLabel('Description').fill('This is an automated test');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page
      .getByRole('navigation', { name: 'breadcrumbs' })
      .getByText(hostCatalogName),
  ).toBeVisible();

  return hostCatalogName;
};

/**
 * Uses the UI to create a new host set. Assumes you have just created a new host catalog.
 * @param {Page} page Playwright page object
 * @returns Name of the host set
 */
exports.createHostSet = async (page) => {
  const hostSetName = 'Host Set ' + nanoid();
  await page.getByRole('link', { name: 'Host Sets' }).click();
  await page.getByRole('link', { name: 'New', exact: true }).click();
  await page.getByLabel('Name').fill(hostSetName);
  await page.getByLabel('Description').fill('This is an automated test');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page
      .getByRole('navigation', { name: 'breadcrumbs' })
      .getByText(hostSetName),
  ).toBeVisible();

  return hostSetName;
};

/**
 * Uses the UI to create a new host in a host set. Assumes you have just created a new host set.
 * @param {Page} page Playwright page object
 * @param {string} address Address of the host
 * @returns Name of the host
 */
exports.createHostInHostSet = async (page, address) => {
  const hostName = 'Host ' + nanoid();
  await page.getByText('Manage').click();
  await page.getByRole('link', { name: 'Create and Add Host' }).click();
  await page.getByLabel('Name').fill(hostName);
  await page.getByLabel('Description').fill('This is an automated test');
  await page.getByLabel('Address').fill(address);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(page.getByRole('link', { name: hostName })).toBeVisible();

  return hostName;
};

/**
 * Uses the UI to create a static credential store. Assumes you have selected the desired project.
 * @param {Page} page Playwright page object
 * @returns Name of the credential store
 */
exports.createStaticCredentialStore = async (page) => {
  const credentialStoreName = 'Credential Store ' + nanoid();
  await page
    .getByRole('navigation', { name: 'Resources' })
    .getByRole('link', { name: 'Credential Stores' })
    .click();
  await page.getByRole('link', { name: 'New', exact: true }).click();
  await page.getByLabel('Name', { exact: true }).fill(credentialStoreName);
  await page.getByLabel('Description').fill('This is an automated test');
  await page.getByRole('group', { name: 'Type' }).getByLabel('Static').click();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page
      .getByRole('navigation', { name: 'breadcrumbs' })
      .getByText(credentialStoreName),
  ).toBeVisible();

  return credentialStoreName;
};

/**
 * Uses the UI to create a vault credential store. Assumes you have selected the desired project.
 * @param {Page} page Playwright page object
 * @param {string} vaultAddr address of the vault server
 * @param {string} clientToken vault token to connect to boundary
 * @returns Name of the credential store
 */
exports.createVaultCredentialStore = async (page, vaultAddr, clientToken) => {
  const credentialStoreName = 'Credential Store ' + nanoid();
  await page
    .getByRole('navigation', { name: 'Resources' })
    .getByRole('link', { name: 'Credential Stores' })
    .click();
  await page.getByRole('link', { name: 'New', exact: true }).click();
  await page.getByLabel('Name', { exact: true }).fill(credentialStoreName);
  await page.getByLabel('Description').fill('This is an automated test');
  await page.getByRole('group', { name: 'Type' }).getByLabel('Vault').click();
  await page.getByLabel('Address', { exact: true }).fill(vaultAddr);
  await page.getByLabel('Token', { exact: true }).fill(clientToken);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page
      .getByRole('navigation', { name: 'breadcrumbs' })
      .getByText(credentialStoreName),
  ).toBeVisible();

  return credentialStoreName;
};

/**
 * Uses the UI to create a static key pair credential . Assumes you have selected the desired project.
 * @param {Page} page Playwright page object
 * @param {string} username username for the credential
 * @param {string} keyPath path to the private key
 * @returns Name of the credential
 */
exports.createStaticCredentialKeyPair = async (page, username, keyPath) => {
  const credentialName = 'Credential ' + nanoid();
  await page.getByRole('link', { name: 'Credentials', exact: true }).click();
  await page.getByRole('link', { name: 'New', exact: true }).click();
  await page.getByLabel('Name', { exact: true }).fill(credentialName);
  await page.getByLabel('Description').fill('This is an automated test');
  await page
    .getByRole('group', { name: 'Type' })
    .getByLabel('Username & Key Pair')
    .click();
  await page.getByLabel('Username', { exact: true }).fill(username);
  const keyData = await readFile(keyPath, {
    encoding: 'utf-8',
  });
  await page.getByLabel('SSH Private Key', { exact: true }).fill(keyData);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page
      .getByRole('navigation', { name: 'breadcrumbs' })
      .getByText(credentialName),
  ).toBeVisible();

  return credentialName;
};

/**
 * Uses the UI to create a vault-generic credential library. Assumes you have selected
 * the desired credential store.
 * @param {Page} page Playwright page object
 * @param {string} vaultPath path to secret in vault
 * @param {string} credentialType type of credential for credential injection
 * @returns Name of the credential library
 */
exports.createVaultGenericCredentialLibrary = async (
  page,
  vaultPath,
  credentialType,
) => {
  const credentialLibraryName = 'Credential Library ' + nanoid();
  await page.getByRole('link', { name: 'Credential Libraries' }).click();
  await page.getByRole('link', { name: 'New', exact: true }).click();
  await page
    .getByLabel('Name (Optional)', { exact: true })
    .fill(credentialLibraryName);
  await page
    .getByLabel('Description (Optional)')
    .fill('This is an automated test');
  await page
    .getByRole('group', { name: 'Type' })
    .getByLabel('Generic Secrets')
    .click();
  await page.getByLabel('Vault Path').fill(vaultPath);
  await page
    .getByRole('combobox', { name: 'Credential Type' })
    .selectOption(credentialType);

  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();

  return credentialLibraryName;
};

/**
 * Uses the UI to create a vault-ssh-certificate credential library. Assumes you have selected
 * the desired credential store.
 * @param {Page} page Playwright page object
 * @param {string} vaultPath path to secret in vault
 * @param {string} username username for the credential
 * @returns Name of the credential library
 */
exports.createVaultSshCertificateCredentialLibrary = async (
  page,
  vaultPath,
  username,
) => {
  const credentialLibraryName = 'Credential Library ' + nanoid();

  await page.getByRole('link', { name: 'Credential Libraries' }).click();
  await page.getByRole('link', { name: 'New', exact: true }).click();

  // Temporarily putting the Group selection first due to a bug where
  // Name and Description fields get cleared when the Group is selected
  await page
    .getByRole('group', { name: 'Type' })
    .getByLabel('SSH Certificates')
    .click();

  await page
    .getByLabel('Name (Optional)', { exact: true })
    .fill(credentialLibraryName);
  await page
    .getByLabel('Description (Optional)')
    .fill('This is an automated test');
  await page.getByLabel('Vault Path').fill(vaultPath);
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Key Type').selectOption('ecdsa');
  await page.getByLabel('Key Bits').fill('521');

  await page
    .getByRole('group', { name: 'Extensions' })
    .getByLabel('Key')
    .fill('permity-pty');
  await page
    .getByRole('group', { name: 'Extensions' })
    .getByRole('button', { name: 'Add' })
    .click();

  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();

  return credentialLibraryName;
};

/**
 * Uses the UI to create a new target. Assumes you have selected the desired project.
 * @param {Page} page Playwright page object
 * @param {string} port Port of the target
 * @returns Name of the target
 */
exports.createTarget = async (page, port) => {
  const targetName = 'Target ' + nanoid();
  await page
    .getByRole('navigation', { name: 'Resources' })
    .getByRole('link', { name: 'Targets' })
    .click();
  await page.getByRole('link', { name: 'New', exact: true }).click();
  await page.getByLabel('Name').fill(targetName);
  await page.getByLabel('Description').fill('This is an automated test');
  await page.getByLabel('Default Port').fill(port);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page.getByRole('navigation', { name: 'breadcrumbs' }).getByText(targetName),
  ).toBeVisible();

  return targetName;
};

/**
 * Uses the UI to create a new target with address. Assumes you have selected the desired project.
 * @param {Page} page Playwright page object
 * @param {string} address Address of the target
 * @param {string} port Port of the target
 * @returns Name of the target
 */
exports.createTargetWithAddress = async (page, address, port) => {
  const targetName = 'Target ' + nanoid();
  await page
    .getByRole('navigation', { name: 'Resources' })
    .getByRole('link', { name: 'Targets' })
    .click();
  await page.getByRole('link', { name: 'New', exact: true }).click();
  await page.getByLabel('Name').fill(targetName);
  await page.getByLabel('Description').fill('This is an automated test');
  await page.getByLabel('Target Address').fill(address);
  await page.getByLabel('Default Port').fill(port);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page.getByRole('navigation', { name: 'breadcrumbs' }).getByText(targetName),
  ).toBeVisible();

  return targetName;
};

/**
 * Uses the UI to create a new TCP target with address in boundary-enterprise
 * Assumes you have selected the desired project.
 * @param {Page} page Playwright page object
 * @param {string} address Address of the target
 * @param {string} port Port of the target
 * @returns Name of the target
 */
exports.createTcpTargetWithAddressEnt = async (page, address, port) => {
  const targetName = 'Target ' + nanoid();
  await page
    .getByRole('navigation', { name: 'Resources' })
    .getByRole('link', { name: 'Targets' })
    .click();
  await page.getByRole('link', { name: 'New', exact: true }).click();
  await page.getByLabel('Name').fill(targetName);
  await page.getByLabel('Description').fill('This is an automated test');
  await page.getByRole('group', { name: 'Type' }).getByLabel('TCP').click();
  await page.getByLabel('Target Address').fill(address);
  await page.getByLabel('Default Port').fill(port);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page.getByRole('navigation', { name: 'breadcrumbs' }).getByText(targetName),
  ).toBeVisible();

  return targetName;
};

/**
 * Uses the UI to create a new SSH target with address in boundary-enterprise
 * Assumes you have selected the desired project.
 * @param {Page} page Playwright page object
 * @param {string} address Address of the target
 * @param {string} port Port of the target
 * @returns Name of the target
 */
exports.createSshTargetWithAddressEnt = async (page, address, port) => {
  const targetName = 'Target ' + nanoid();
  await page
    .getByRole('navigation', { name: 'Resources' })
    .getByRole('link', { name: 'Targets' })
    .click();
  await page.getByRole('link', { name: 'New', exact: true }).click();
  await page.getByLabel('Name').fill(targetName);
  await page.getByLabel('Description').fill('This is an automated test');
  await page.getByRole('group', { name: 'Type' }).getByLabel('SSH').click();
  await page.getByLabel('Target Address').fill(address);
  await page.getByLabel('Default Port').fill(port);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page.getByRole('navigation', { name: 'breadcrumbs' }).getByText(targetName),
  ).toBeVisible();

  return targetName;
};

/**
 * Uses the UI to create a new SSH target with address in boundary-enterprise
 * Assumes you have selected the desired project.
 * @param {Page} page Playwright page object
 * @param {string} address Address of the target
 * @param {string} port Port of the target
 * @param {string} workerFilterEgress Egress worker filter
 * @returns Name of the target
 */
exports.createSshTargetWithAddressAndWorkerFilterEnt = async (
  page,
  address,
  port,
  workerFilterEgress,
) => {
  const targetName = 'Target ' + nanoid();
  await page
    .getByRole('navigation', { name: 'Resources' })
    .getByRole('link', { name: 'Targets' })
    .click();
  await page.getByRole('link', { name: 'New', exact: true }).click();
  await page.getByLabel('Name').fill(targetName);
  await page.getByLabel('Description').fill('This is an automated test');
  await page.getByRole('group', { name: 'Type' }).getByLabel('SSH').click();
  await page.getByLabel('Target Address').fill(address);
  await page.getByLabel('Default Port').fill(port);
  await page.getByLabel('Egress worker filter').click();
  await page.getByRole('textbox', { name: 'Filter' }).fill(workerFilterEgress);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page.getByRole('navigation', { name: 'breadcrumbs' }).getByText(targetName),
  ).toBeVisible();

  return targetName;
};

/**
 * Uses the UI to delete a Boundary resource. Assume you have selected the desired resource.
 * Note: For a resource to be deleted using this method,
 * the resource page should allow to delete the resource using the Manage button.
 * @param {Page} page Playwright page object
 */
exports.deleteResource = async (page) => {
  await page.getByTitle('Manage').click();
  await page.getByRole('button', { name: /^(Delete|Remove Worker)/ }).click();
  await page.getByText('OK', { exact: true }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
};

/**
 * Uses the UI to remove auth method as primary. Assume you have selected the desired auth method.
 * @param {Page} page Playwright page object
 */
exports.removeAuthMethodAsPrimary = async (page) => {
  await page.getByTitle('Manage').click();
  await page.getByRole('button', { name: 'Remove as primary' }).click();
  await page.getByText('OK', { exact: true }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
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
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(page.getByRole('link', { name: hostSourceName })).toBeVisible();
};

/**
 * Uses the UI to navigate to Sessions and waits for the session to appear
 * and be in Active state.
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
  let sessionIsActive = false;
  do {
    i = i + 1;
    sessionIsVisible = await page
      .getByRole('cell', { name: targetName })
      .isVisible();
    sessionIsActive = await page
      .getByRole('cell', { name: 'Active' })
      .isVisible();
    if (sessionIsVisible && sessionIsActive) {
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
  credentialName,
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
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(page.getByRole('link', { name: credentialName })).toBeVisible();
};

/**
 * Uses the UI to navigate to the specified Target and add the Injected Credentials to it.
 * @param {Page} page Playwright page object
 * @param {string} targetName Name of the target associated with the session
 * @param {string} credentialName Name of the credentials to be added to the target
 */
exports.addInjectedCredentialsToTarget = async (
  page,
  targetName,
  credentialName,
) => {
  await page
    .getByRole('navigation', { name: 'Resources' })
    .getByRole('link', { name: 'Targets' })
    .click();
  await page.getByRole('link', { name: targetName }).click();
  await page
    .getByRole('link', {
      name: 'Injected Application Credentials',
      exact: true,
    })
    .click();
  await page
    .getByRole('article')
    .getByRole('link', {
      name: 'Add Injected Application Credentials',
      exact: true,
    })
    .click();
  await page
    .getByRole('cell', { name: credentialName })
    .locator('..')
    .getByRole('checkbox')
    .click({ force: true });
  await page
    .getByRole('button', {
      name: 'Add Injected Application Credentials',
      exact: true,
    })
    .click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(page.getByRole('link', { name: credentialName })).toBeVisible();
};

/**
 * Uses the UI to create new Auth Method. Assumes you have selected the desired scope.
 * @param {Page} page Playwright page object
 * @returns Name of the auth method
 */
exports.createPasswordAuthMethod = async (page) => {
  const authMethodName = 'Auth Method ' + nanoid();
  await page
    .getByRole('navigation', { name: 'IAM' })
    .getByRole('link', { name: 'Auth Methods' })
    .click();
  await page.getByRole('button', { name: 'New' }).click();
  await page.getByText('Password', { exact: true }).click();
  await page.getByLabel('Name').fill(authMethodName);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page
      .getByRole('navigation', { name: 'breadcrumbs' })
      .getByText(authMethodName),
  ).toBeVisible();

  return authMethodName;
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
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
};

/**
 * Uses the UI to create new password Account. Assumes you have selected the desired Auth Method
 * which the account will be created for.
 * @param {Page} page Playwright page object
 * @param {string} login Login of new account
 * @param {string} password Password of new account
 * @returns Name of the account
 */
exports.createPasswordAccount = async (page, login, password) => {
  const accountName = 'Account ' + nanoid();

  await page.getByRole('link', { name: 'Accounts' }).click();
  await page
    .getByRole('article')
    .getByRole('link', { name: 'Create Account', exact: true })
    .click();
  await page.getByLabel('Name', { exact: true }).fill(accountName);
  await page.getByLabel('Login Name').fill(login);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page
      .getByRole('navigation', { name: 'breadcrumbs' })
      .getByText(accountName),
  ).toBeVisible();

  return accountName;
};

/**
 * Uses the UI to set a new password to an account.
 * Assumes you have selected the desired Account.
 * @param {Page} page Playwright page object
 * @param {string} password New password of the account
 */
exports.setPasswordToAccount = async (page, password) => {
  await page.getByRole('link', { name: 'Set Password' }).click();
  await page.getByLabel(new RegExp('Password*')).fill(password);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
};

/**
 * Uses the UI to create a new user.
 * @param {Page} page Playwright page object
 * @returns Name of the user
 */
exports.createUser = async (page) => {
  const userName = 'User ' + nanoid();
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
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page.getByRole('navigation', { name: 'breadcrumbs' }).getByText(userName),
  ).toBeVisible();

  return userName;
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
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
};

/**
 * Uses the UI to create a new group. Assumes you have selected the desired scope.
 * @param {Page} page Playwright page object
 * @returns Name of the group
 */
exports.createGroup = async (page) => {
  const groupName = 'Group ' + nanoid();
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
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page.getByRole('navigation', { name: 'breadcrumbs' }).getByText(groupName),
  ).toBeVisible();

  return groupName;
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
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(page.getByRole('table').getByText(userName)).toBeVisible();
};

/**
 * Uses the UI to create a new role. Assumes you have selected the desired scope.
 * @param {Page} page Playwright page object
 */
exports.createRole = async (page) => {
  const roleName = 'Role ' + nanoid();

  await page
    .getByRole('navigation', { name: 'IAM' })
    .getByRole('link', { name: 'Roles' })
    .click();
  await page.getByRole('link', { name: 'New Role' }).click();
  await page.getByLabel('Name').fill(roleName);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page.getByRole('navigation', { name: 'breadcrumbs' }).getByText(roleName),
  ).toBeVisible();

  return roleName;
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
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page.getByRole('table').getByRole('link', { name: principalName }),
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
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page.getByRole('textbox', { name: 'Grant', exact: true }),
  ).toHaveValue(grants);
};

/**
 * Uses the UI to create a new Storage Bucket. Assumes you have selected the desired scope.
 * @param {Page} page Playwright page object
 * @param {string} bucketName Name of the Storage Bucket
 * @param {string} region Region of the Storage Bucket
 * @param {string} accessKeyId Access Key ID for the Storage Bucket
 * @param {string} secretAccessKey Secret Access Key for the Storage Bucket
 * @param {string} workerFilter Worker filter for the Storage Bucket
 * @returns Name of the Storage Bucket
 */
exports.createStorageBucket = async (
  page,
  bucketName,
  region,
  accessKeyId,
  secretAccessKey,
  workerFilter,
) => {
  const storageBucketName = 'Bucket ' + nanoid();
  await page
    .getByRole('link', { name: 'Storage Buckets', exact: true })
    .click();
  await page.getByRole('link', { name: 'New Storage Bucket' }).click();
  await page.getByLabel(new RegExp('Name*')).fill(storageBucketName);
  await page.getByLabel('Bucket name').fill(bucketName);
  await page.getByLabel('Region').fill(region);
  await page.getByLabel('Access key ID').fill(accessKeyId);
  await page.getByLabel('Secret access key').fill(secretAccessKey);
  await page.getByLabel('Worker filter').fill(workerFilter);
  await page.getByLabel('Disable credential rotation').click();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page
      .getByRole('navigation', { name: 'breadcrumbs' })
      .getByText(storageBucketName),
  ).toBeVisible();

  return storageBucketName;
};

/**
 * Uses the UI to enable session recording for a target. Assumes you have selected the desired target.
 * @param {Page} page Playwright page object
 * @param {string} storageBucketName name of the Storage Bucket used for session recording
 */
exports.enableSessionRecording = async (page, storageBucketName) => {
  await page.getByText('Enable recording').click();
  await page.getByLabel('Record sessions for this target').click();
  await page
    .getByLabel('AWS storage buckets')
    .selectOption({ label: storageBucketName });
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page.getByRole('listitem').getByText(storageBucketName),
  ).toBeVisible();
};

/**
 * Uses the UI to create a Storage Policy. Assumes you have selected the desired scope.
 * @param {Page} page Playwright page object
 * @returns Name of the Storage Policy
 */
exports.createStoragePolicy = async (page) => {
  const storagePolicyName = 'Policy ' + nanoid();
  await page
    .getByRole('link', { name: 'Storage Policies', exact: true })
    .click();
  await page
    .getByRole('link', { name: 'Create a new storage policy', exact: true })
    .click();
  await page.getByLabel('Name').fill(storagePolicyName);
  await page.getByLabel('Retention Policy').selectOption({ label: 'Forever' });
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page
      .getByRole('navigation', { name: 'breadcrumbs' })
      .getByText(storagePolicyName),
  ).toBeVisible();

  return storagePolicyName;
};

/**
 * Uses the UI to attach Storage Policy to a scope. Assumes you have selected the desired scope.
 * @param {Page} page Playwright page object
 * @param {string} policyName name of the Policy to be attached to the scope
 */
exports.attachStoragePolicy = async (page, policyName) => {
  await page
    .getByRole('link', { name: new RegExp('/*Settings'), exact: true })
    .click();
  await page.getByText('Add Storage Policy').click();
  await page.getByLabel('Storage Policy').selectOption({ label: policyName });
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(page.getByRole('listitem').getByText(policyName)).toBeVisible();
};
