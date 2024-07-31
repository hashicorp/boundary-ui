/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

/* eslint-disable no-undef */
const { expect } = require('@playwright/test');

/**
 * Uses the UI to delete a Boundary resource. Assume you have selected the desired resource.
 * Note: For a resource to be deleted using this method,
 * the resource page should allow to delete the resource using the Manage button.
 * @param {Page} page Playwright page object
 */
exports.deleteResource = async (page) => {
  await page.getByText('Manage').click();
  await page.getByRole('button', { name: /^(Delete|Remove Worker)/ }).click();
  await page.getByText('OK', { exact: true }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
};
