/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../../global-setup.js';
import { expect } from '@playwright/test';

import * as boundaryCli from '../../helpers/boundary-cli';
import { OrgsPage } from '../pages/orgs.js';
import { StoragePoliciesPage } from '../pages/storage-policies.js';

test(
  'Global Settings',
  { tag: ['@ent', '@aws', '@docker'] },
  async ({
    page,
    controllerAddr,
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
        .getByRole('navigation', { name: 'Primary' })
        .getByRole('link', { name: 'Orgs' })
        .click();
      await expect(page.getByRole('heading', { name: 'Orgs' })).toBeVisible();
    } finally {
      if (policyName) {
        await boundaryCli.authenticateBoundary(
          controllerAddr,
          adminAuthMethodId,
          adminLoginName,
          adminPassword,
        );
        const storagePolicyId = await boundaryCli.getPolicyIdFromName(
          'global',
          policyName,
        );
        await boundaryCli.deletePolicy(storagePolicyId);
      }
    }
  },
);
