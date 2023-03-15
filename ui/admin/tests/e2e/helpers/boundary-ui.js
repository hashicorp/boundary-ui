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
  await page.getByLabel('Address').fill(process.env.E2E_TARGET_IP);
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
  await page.getByLabel('Default Port').fill(process.env.E2E_SSH_PORT);
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
