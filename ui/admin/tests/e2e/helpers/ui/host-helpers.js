/* eslint-disable no-undef */
const { expect } = require('@playwright/test');
const { nanoid } = require('nanoid');

// exports.createHostCatalog = async (page) => {
/**
 * Uses the UI to create a new host catalog. Assumes you have selected the desired project.
 * @param {Page} page Playwright page object
 * @returns Name of the host catalog
 */
export async function createHostCatalog(page) {
  const hostCatalogName = 'Host Catalog ' + nanoid();
  await page
    .getByRole('navigation', { name: 'Resources' })
    .getByRole('link', { name: 'Host Catalogs' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Host Catalogs' }),
  ).toBeVisible();

  const newButtonIsVisible = await page
    .getByRole('link', { name: 'New', exact: true })
    .isVisible();
  if (newButtonIsVisible) {
    await page.getByRole('link', { name: 'New', exact: true }).click();
  } else {
    await page
      .getByRole('link', { name: 'New Host Catalog', exact: true })
      .click();
  }

  await page.getByLabel('Name').fill(hostCatalogName);
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
      .getByText(hostCatalogName),
  ).toBeVisible();

  return hostCatalogName;
}

/**
 * Uses the UI to create a new host set. Assumes you have just created a new host catalog.
 * @param {Page} page Playwright page object
 * @returns Name of the host set
 */
export async function createHostSet(page) {
  const hostSetName = 'Host Set ' + nanoid();
  await page.getByRole('link', { name: 'Host Sets' }).click();
  await expect(
    page
      .getByRole('navigation', { name: 'breadcrumbs' })
      .getByText('Host Sets'),
  ).toBeVisible();

  const emptyLinkIsVisible = await page
    .getByRole('link', { name: 'New', exact: true })
    .isVisible();
  if (emptyLinkIsVisible) {
    await page.getByRole('link', { name: 'New', exact: true }).click();
  } else {
    await page.getByText('Manage').click();
    await page.getByRole('link', { name: 'New Host Set' }).click();
  }

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
}

/**
 * Uses the UI to create a new host in a host set. Assumes you have just created a new host set.
 * @param {Page} page Playwright page object
 * @param {string} address Address of the host
 * @returns Name of the host
 */
export async function createHostInHostSet(page, address) {
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
}
