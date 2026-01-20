/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../../global-setup.js';
import { expect } from '@playwright/test';

import * as boundaryCli from '../../helpers/boundary-cli';
import { BasePage } from '../pages/base.js';
import { HostCatalogsPage } from '../pages/host-catalogs.js';
import { OrgsPage } from '../pages/orgs.js';
import { ProjectsPage } from '../pages/projects.js';
import { SessionsPage } from '../pages/sessions.js';
import { TargetsPage } from '../pages/targets.js';

test.beforeAll(async () => {
  await boundaryCli.checkBoundaryCli();
});

test(
  'Verify session created to target with host, then cancel the session',
  { tag: ['@ce', '@aws', '@docker'] },
  async ({
    page,
    controllerAddr,
    adminAuthMethodId,
    adminLoginName,
    adminPassword,
    sshUser,
    sshKeyPath,
    targetAddress,
    targetPort,
  }) => {
    await page.goto('/');
    let orgId;
    let connect;
    try {
      const orgsPage = new OrgsPage(page);
      const orgName = await orgsPage.createOrg();
      const projectsPage = new ProjectsPage(page);
      const projectName = await projectsPage.createProject();

      // Create host set
      const hostCatalogsPage = new HostCatalogsPage(page);
      const hostCatalogName = await hostCatalogsPage.createHostCatalog();
      const hostSetName = await hostCatalogsPage.createHostSet();
      await hostCatalogsPage.createHostInHostSet(targetAddress);

      // Create another host set
      await page
        .getByRole('navigation', { name: 'Application local navigation' })
        .getByRole('link', { name: 'Host Catalogs' })
        .click();
      await page.getByRole('link', { name: hostCatalogName }).click();
      const hostSetName2 = await hostCatalogsPage.createHostSet();

      // Create target
      const targetsPage = new TargetsPage(page);
      const targetName = await targetsPage.createTarget({ port: targetPort });
      await targetsPage.addHostSourceToTarget(hostSetName);

      // Add/Remove another host source
      await targetsPage.addHostSourceToTarget(hostSetName2);
      await targetsPage.removeHostSourceFromTarget(hostSetName2);

      // Connect to target
      await boundaryCli.authenticateBoundary(
        controllerAddr,
        adminAuthMethodId,
        adminLoginName,
        adminPassword,
      );
      orgId = await boundaryCli.getOrgIdFromName(orgName);
      const projectId = await boundaryCli.getProjectIdFromName(
        orgId,
        projectName,
      );
      const targetId = await boundaryCli.getTargetIdFromName(
        projectId,
        targetName,
      );
      connect = await boundaryCli.connectToTarget(
        targetId,
        sshUser,
        sshKeyPath,
      );
      const sessionsPage = new SessionsPage(page);
      await sessionsPage.waitForSessionToBeVisible(targetName);
      await page
        .getByRole('row')
        .filter({ has: page.getByRole('cell', { name: targetName }) })
        .getByRole('button', { name: 'Cancel' })
        .click();
    } finally {
      if (orgId) {
        await boundaryCli.deleteScope(orgId);
      }
      // End `boundary connect` process
      if (connect) {
        connect.kill('SIGTERM');
      }
    }
  },
);

test(
  'Verify session created to target with address, then cancel the session',
  { tag: ['@ce', '@aws', '@docker'] },
  async ({
    page,
    controllerAddr,
    adminAuthMethodId,
    adminLoginName,
    adminPassword,
    sshUser,
    sshKeyPath,
    targetAddress,
    targetPort,
  }) => {
    await page.goto('/');
    let orgId;
    let connect;
    try {
      const orgsPage = new OrgsPage(page);
      const orgName = await orgsPage.createOrg();
      const projectsPage = new ProjectsPage(page);
      const projectName = await projectsPage.createProject();
      const targetsPage = new TargetsPage(page);
      const targetName = await targetsPage.createTarget({
        port: targetPort,
        address: targetAddress,
      });

      await boundaryCli.authenticateBoundary(
        controllerAddr,
        adminAuthMethodId,
        adminLoginName,
        adminPassword,
      );
      orgId = await boundaryCli.getOrgIdFromName(orgName);
      const projectId = await boundaryCli.getProjectIdFromName(
        orgId,
        projectName,
      );
      const targetId = await boundaryCli.getTargetIdFromName(
        projectId,
        targetName,
      );
      connect = await boundaryCli.connectToTarget(
        targetId,
        sshUser,
        sshKeyPath,
      );
      const sessionsPage = new SessionsPage(page);
      await sessionsPage.waitForSessionToBeVisible(targetName);
      await page
        .getByRole('row')
        .filter({ has: page.getByRole('cell', { name: targetName }) })
        .getByRole('button', { name: 'Cancel' })
        .click();
    } finally {
      if (orgId) {
        await boundaryCli.deleteScope(orgId);
      }
      // End `boundary connect` process
      if (connect) {
        connect.kill('SIGTERM');
      }
    }
  },
);

test(
  'Verify TCP target is updated',
  { tag: ['@ce', '@aws', '@docker'] },
  async ({
    page,
    controllerAddr,
    adminAuthMethodId,
    adminLoginName,
    adminPassword,
    targetAddress,
    targetPort,
  }) => {
    await page.goto('/');
    let orgName;
    try {
      const orgsPage = new OrgsPage(page);
      orgName = await orgsPage.createOrg();
      const projectsPage = new ProjectsPage(page);
      await projectsPage.createProject();
      const targetsPage = new TargetsPage(page);
      await targetsPage.createTarget({
        port: targetPort,
        address: targetAddress,
      });

      // Update target
      await page.getByRole('button', { name: 'Edit Form' }).click();
      await page.getByLabel('Name').fill('New target name');
      await page.getByLabel('Description').fill('New description');
      await page.getByLabel('Target Address').fill('127.0.0.1');
      await page.getByLabel('Default Port').fill('10');
      await page.getByLabel('Default Client Port').fill('10');
      await page.getByLabel('Maximum Duration').fill('1000');
      await page.getByLabel('Maximum Connections').fill('10');
      await page.getByRole('button', { name: 'Save' }).click();

      await expect(
        page.getByRole('alert').getByText('Success', { exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Dismiss' }).click();

      await targetsPage.addEgressWorkerFilterToTarget('"dev" in "/tags/type"');

      // Edit a worker filter
      await page.getByRole('link', { name: 'Workers', exact: true }).click();
      await expect(
        page
          .getByRole('navigation', { name: 'breadcrumbs' })
          .getByText('Workers'),
      ).toBeVisible();
      await page
        .getByText('Egress workers')
        .locator('..')
        .getByRole('link', { name: 'Edit worker filter' })
        .click();
      await expect(
        page
          .getByRole('navigation', { name: 'breadcrumbs' })
          .getByText('Edit Egress Worker Filter'),
      ).toBeVisible();
      await expect(page.getByText('"dev" in "/tags/type"')).toBeVisible();

      await page
        .locator('.CodeMirror')
        .getByRole('textbox')
        .click({ force: true });
      const selectAllShortcut =
        process.platform === 'darwin' ? 'Meta+A' : 'Control+A';
      await page.keyboard.press(selectAllShortcut);
      await page.keyboard.press('Backspace');
      await page
        .locator('.CodeMirror')
        .getByRole('textbox')
        .fill('"prod" in "/tags/type"');
      await page.getByRole('button', { name: 'Save' }).click();
      const basePage = new BasePage(page);
      await basePage.dismissSuccessAlert();
    } finally {
      await boundaryCli.authenticateBoundary(
        controllerAddr,
        adminAuthMethodId,
        adminLoginName,
        adminPassword,
      );
      const orgId = await boundaryCli.getOrgIdFromName(orgName);
      if (orgId) {
        await boundaryCli.deleteScope(orgId);
      }
    }
  },
);
