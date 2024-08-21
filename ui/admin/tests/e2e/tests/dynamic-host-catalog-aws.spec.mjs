/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test, expect } from '@playwright/test';
import { nanoid } from 'nanoid';

import { authenticatedState } from '../global-setup.mjs';
import { checkEnv } from '../helpers/general.mjs';
import {
  authenticateBoundaryCli,
  deleteScopeCli,
  getOrgIdFromNameCli,
} from '../helpers/boundary-cli.mjs';
import { HostCatalogsPage } from '../pages/host-catalogs.mjs';
import { OrgsPage } from '../pages/orgs.mjs';
import { ProjectsPage } from '../pages/projects.mjs';
import { TargetsPage } from '../pages/targets.mjs';

test.use({ storageState: authenticatedState });

test.beforeAll(async () => {
  await checkEnv([
    'E2E_AWS_ACCESS_KEY_ID',
    'E2E_AWS_SECRET_ACCESS_KEY',
    'E2E_AWS_HOST_SET_FILTER',
    'E2E_AWS_HOST_SET_IPS',
    'E2E_AWS_REGION',
    'E2E_TARGET_PORT',
  ]);
});

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('AWS', async () => {
  test('Create an AWS Dynamic Host Catalog and set up Host Sets @ce @ent @aws', async ({
    page,
  }) => {
    let orgName;
    try {
      const orgsPage = new OrgsPage(page);
      orgName = await orgsPage.createOrg();
      const projectsPage = new ProjectsPage(page);
      await projectsPage.createProject();

      // Create host catalog
      const hostCatalogName = 'Host Catalog ' + nanoid();
      await page
        .getByRole('navigation', { name: 'Resources' })
        .getByRole('link', { name: 'Host Catalogs' })
        .click();
      await page.getByRole('link', { name: 'New', exact: true }).click();
      await page.getByLabel('Name').fill(hostCatalogName);
      await page.getByLabel('Description').fill('This is an automated test');
      await page
        .getByRole('group', { name: 'Type' })
        .getByLabel('Dynamic')
        .click();
      await page
        .getByRole('group', { name: 'Provider' })
        .getByLabel('AWS')
        .click();
      await page.getByLabel('AWS Region').fill(process.env.E2E_AWS_REGION);
      await page
        .getByLabel('Access Key ID')
        .fill(process.env.E2E_AWS_ACCESS_KEY_ID);
      await page
        .getByLabel('Secret Access Key')
        .fill(process.env.E2E_AWS_SECRET_ACCESS_KEY);
      await page
        .getByLabel('Disable credential rotation')
        .click({ force: true });
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

      // Create first host set
      const hostSetName = 'Host Set ' + nanoid();
      await page.getByRole('link', { name: 'Host Sets' }).click();
      await page.getByRole('link', { name: 'New', exact: true }).click();
      await page.getByLabel('Name (Optional)').fill(hostSetName);
      await page.getByLabel('Description').fill('This is an automated test');
      await page
        .getByRole('group', { name: 'Filter' })
        .getByRole('textbox')
        .fill(process.env.E2E_AWS_HOST_SET_FILTER);
      await page
        .getByRole('group', { name: 'Filter' })
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
          .getByText(hostSetName),
      ).toBeVisible();

      await page.getByRole('link', { name: 'Hosts' }).click();
      await expect(
        page
          .getByRole('navigation', { name: 'breadcrumbs' })
          .getByText('Hosts'),
      ).toBeVisible();

      // Check number of hosts in host set
      let i = 0;
      let rowCount = 0;
      let expectedHosts = JSON.parse(process.env.E2E_AWS_HOST_SET_IPS);
      do {
        i = i + 1;
        // Getting the number of rows in the second rowgroup (the first rowgroup is the header row)
        rowCount = await page
          .getByRole('table')
          .getByRole('rowgroup')
          .nth(1)
          .getByRole('row')
          .count();
        await page.reload();
        await page
          .getByRole('navigation', { name: 'breadcrumbs' })
          .getByText(hostSetName)
          .waitFor();
      } while (i < 5);

      expect(rowCount).toBe(expectedHosts.length);

      // Navigate to each host in the host set
      for (let i = 0; i < expectedHosts.length; i++) {
        const host = await page
          .getByRole('table')
          .getByRole('rowgroup')
          .nth(1)
          .getByRole('row')
          .nth(i)
          .getByRole('link');

        let hostName = await host.innerText();
        await host.click();
        await expect(
          page
            .getByRole('navigation', { name: 'breadcrumbs' })
            .getByText(hostName),
        ).toBeVisible();

        await page
          .getByRole('navigation', { name: 'breadcrumbs' })
          .getByText(hostSetName)
          .click();
        await page.getByRole('link', { name: 'Hosts' }).click();
      }

      // Create a target and add DHC host set as a host source
      const targetsPage = new TargetsPage(page);
      const targetName = await targetsPage.createTarget(
        process.env.E2E_TARGET_PORT,
      );
      await targetsPage.addHostSourceToTarget(hostSetName);

      // Add another host source
      const hostCatalogsPage = new HostCatalogsPage(page);
      await hostCatalogsPage.createHostCatalog();
      const newHostSetName = await hostCatalogsPage.createHostSet();
      await page
        .getByRole('navigation', { name: 'Resources' })
        .getByRole('link', { name: 'Targets' })
        .click();
      await page.getByRole('link', { name: targetName }).click();
      await targetsPage.addHostSourceToTarget(newHostSetName);

      // Remove the host source from the target
      await page
        .getByRole('link', { name: newHostSetName })
        .locator('..')
        .locator('..')
        .getByRole('button', { name: 'Manage' })
        .click();
      await page.getByRole('button', { name: 'Remove' }).click();
      await page.getByRole('button', { name: 'OK', exact: true }).click();
      await expect(
        page.getByRole('alert').getByText('Success', { exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Dismiss' }).click();

      // Add the host source back
      await targetsPage.addHostSourceToTarget(newHostSetName);
    } finally {
      await authenticateBoundaryCli(
        process.env.BOUNDARY_ADDR,
        process.env.E2E_PASSWORD_AUTH_METHOD_ID,
        process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
        process.env.E2E_PASSWORD_ADMIN_PASSWORD,
      );

      if (orgName) {
        const orgId = await getOrgIdFromNameCli(orgName);
        if (orgId) {
          await deleteScopeCli(orgId);
        }
      }
    }
  });
});
