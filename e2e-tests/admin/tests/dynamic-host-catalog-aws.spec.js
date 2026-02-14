/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../../global-setup.js';
import { expect } from '@playwright/test';
import { nanoid } from 'nanoid';

import * as boundaryCli from '../../helpers/boundary-cli';
import { CredentialStoresPage } from '../pages/credential-stores.js';
import { HostCatalogsPage } from '../pages/host-catalogs.js';
import { OrgsPage } from '../pages/orgs.js';
import { ProjectsPage } from '../pages/projects.js';
import { SessionsPage } from '../pages/sessions.js';
import { TargetsPage } from '../pages/targets.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('AWS', () => {
  test(
    'Create an AWS Dynamic Host Catalog and set up Host Sets',
    { tag: ['@ce', '@aws'] },
    async ({
      page,
      controllerAddr,
      adminAuthMethodId,
      adminLoginName,
      adminPassword,
      awsAccessKeyId,
      awsHostSetFilter,
      awsHostSetIps,
      awsRegion,
      awsSecretAccessKey,
      targetPort,
      sshUser,
      sshKeyPath,
    }) => {
      let orgName;
      let connect;
      try {
        const orgsPage = new OrgsPage(page);
        orgName = await orgsPage.createOrg();
        const projectsPage = new ProjectsPage(page);
        const projectName = await projectsPage.createProject();

        // Create host catalog
        const hostCatalogName = 'Host Catalog ' + nanoid();
        await page
          .getByRole('navigation', { name: 'Primary' })
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
        await page.getByLabel('AWS Region').fill(awsRegion);
        await page.getByLabel('Access Key ID').fill(awsAccessKeyId);
        await page.getByLabel('Secret Access Key').fill(awsSecretAccessKey);
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
          .fill(awsHostSetFilter);
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
        const expectedHosts = JSON.parse(awsHostSetIps);
        await expect(async () => {
          const rowCount = await page
            .getByRole('table')
            .getByRole('row')
            .filter({ hasNot: page.getByRole('columnheader') })
            .count();

          if (rowCount !== expectedHosts.length) {
            await page.reload();
            await page
              .getByRole('navigation', { name: 'breadcrumbs' })
              .getByText(hostSetName)
              .waitFor();
          }
          expect(rowCount).toBe(expectedHosts.length);
        }).toPass();

        // Navigate to each host in the host set
        for (const row of await page
          .getByRole('table')
          .getByRole('rowgroup')
          .nth(1)
          .getByRole('row')
          .all()) {
          const host = row.getByRole('link');
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
        const targetName = await targetsPage.createTarget({
          port: targetPort,
        });
        await targetsPage.addHostSourceToTarget(hostSetName);

        // Add another host source
        const hostCatalogsPage = new HostCatalogsPage(page);
        await hostCatalogsPage.createHostCatalog();
        const newHostSetName = await hostCatalogsPage.createHostSet();
        await page
          .getByRole('navigation', { name: 'Primary' })
          .getByRole('link', { name: 'Targets' })
          .click();
        await page.getByRole('link', { name: targetName }).click();
        await targetsPage.addHostSourceToTarget(newHostSetName);

        // Remove the host source from the target
        await page
          .getByRole('row')
          .filter({ has: page.getByRole('link', { name: newHostSetName }) })
          .getByRole('button', { name: 'Manage' })
          .click();
        await page.getByRole('button', { name: 'Remove' }).click();
        await page.getByRole('button', { name: 'OK', exact: true }).click();
        await expect(
          page.getByRole('alert').getByText('Success', { exact: true }),
        ).toBeVisible();
        await page.getByRole('button', { name: 'Dismiss' }).click();

        // Set up target credentials
        const credentialStoresPage = new CredentialStoresPage(page);
        await credentialStoresPage.createStaticCredentialStore();
        const credentialName =
          await credentialStoresPage.createStaticCredentialKeyPair(
            sshUser,
            sshKeyPath,
          );
        await targetsPage.addBrokeredCredentialsToTarget(
          targetName,
          credentialName,
        );

        // Connect to target
        await boundaryCli.authenticateBoundary(
          controllerAddr,
          adminAuthMethodId,
          adminLoginName,
          adminPassword,
        );
        const orgId = await boundaryCli.getOrgIdFromName(orgName);
        const projectId = await boundaryCli.getProjectIdFromName(
          orgId,
          projectName,
        );
        const targetId = await boundaryCli.getTargetIdFromName(
          projectId,
          targetName,
        );
        connect = await boundaryCli.connectSshToTarget(targetId);
        const sessionsPage = new SessionsPage(page);
        await sessionsPage.waitForSessionToBeVisible(targetName);
      } finally {
        if (connect) {
          connect.kill('SIGTERM');
        }

        await boundaryCli.authenticateBoundary(
          controllerAddr,
          adminAuthMethodId,
          adminLoginName,
          adminPassword,
        );

        if (orgName) {
          const orgId = await boundaryCli.getOrgIdFromName(orgName);
          if (orgId) {
            await boundaryCli.deleteScope(orgId);
          }
        }
      }
    },
  );
});
