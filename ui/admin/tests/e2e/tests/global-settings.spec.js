/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

/* eslint-disable no-undef */
const { test, expect } = require('@playwright/test');
const { authenticatedState } = require('../helpers/general');
const {
  attachStoragePolicy,
  createStoragePolicy,
} = require('../helpers/boundary-ui');

test.use({ storageState: authenticatedState });

test('Global Settings @ent @aws @docker', async ({ page }) => {
  await page.goto('/');

  // Create a storage policy
  const policyName = await createStoragePolicy(page);
  await attachStoragePolicy(page, policyName);

  // Detach storage policy
  await page.getByRole('button', { name: 'Manage', exact: true }).click();
  await page
    .getByRole('button', { name: 'Detach Storage Policy', exact: true })
    .click();
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();

  // Navigate to orgs page when done
  await page
    .getByRole('navigation', { name: 'General' })
    .getByRole('link', { name: 'Orgs' })
    .click();
  await expect(page.getByRole('heading', { name: 'Orgs' })).toBeVisible();
});
