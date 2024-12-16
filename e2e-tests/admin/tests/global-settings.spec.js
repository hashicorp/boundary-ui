/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test, authenticatedState } from '../../global-setup.js';
import { expect } from '@playwright/test';

import * as boundaryCli from '../../helpers/boundary-cli';
import { OrgsPage } from '../pages/orgs.js';
import { StoragePoliciesPage } from '../pages/storage-policies.js';

test.use({ storageState: authenticatedState });

test('Global Settings @ent @aws @docker', async ({
  page,
  baseURL,
  adminAuthMethodId,
  adminLoginName,
  adminPassword,
}) => {
  await page.goto('/');
  let policyName;
  try {
    // Create a storage policy
    const storagePoliciesPage = new StoragePoliciesPage(page);
    policyName = await storagePoliciesPage.createStoragePolicy();
    const orgsPage = new OrgsPage(page);
    await orgsPage.attachStoragePolicy(policyName);

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
  } finally {
    if (policyName) {
      await boundaryCli.authenticateBoundaryCli(
        baseURL,
        adminAuthMethodId,
        adminLoginName,
        adminPassword,
      );
      const storagePolicyId = await boundaryCli.getPolicyIdFromNameCli(
        'global',
        policyName,
      );
      await boundaryCli.deletePolicyCli(storagePolicyId);
    }
  }
});
