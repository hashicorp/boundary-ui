/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../playwright.config.mjs'
import { expect } from '@playwright/test';

import { authenticatedState } from '../global-setup.mjs';
import {
  authenticateBoundaryCli,
  checkBoundaryCli,
  connectToTarget,
  deleteScopeCli,
  getOrgIdFromNameCli,
  getProjectIdFromNameCli,
  getTargetIdFromNameCli,
} from '../helpers/boundary-cli.mjs';
import { HostCatalogsPage } from '../pages/host-catalogs.mjs';
import { OrgsPage } from '../pages/orgs.mjs';
import { ProjectsPage } from '../pages/projects.mjs';
import { SessionsPage } from '../pages/sessions.mjs';
import { TargetsPage } from '../pages/targets.mjs';

test.use({ storageState: authenticatedState });

test.beforeAll(async () => {
  await checkBoundaryCli();
});

test('Verify session created to target with host, then cancel the session @ce @aws @docker', async ({
  page,
  baseURL,
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
      .getByRole('navigation', { name: 'Resources' })
      .getByRole('link', { name: 'Host Catalogs' })
      .click();
    await page.getByRole('link', { name: hostCatalogName }).click();
    const hostSetName2 = await hostCatalogsPage.createHostSet();

    // Create target
    const targetsPage = new TargetsPage(page);
    const targetName = await targetsPage.createTarget(targetPort);
    await targetsPage.addHostSourceToTarget(hostSetName);

    // Add/Remove another host source
    await targetsPage.addHostSourceToTarget(hostSetName2);
    await targetsPage.removeHostSourceFromTarget(hostSetName2);

    // Connect to target
    await authenticateBoundaryCli(
      baseURL,
      adminAuthMethodId,
      adminLoginName,
      adminPassword,
    );
    orgId = await getOrgIdFromNameCli(orgName);
    const projectId = await getProjectIdFromNameCli(orgId, projectName);
    const targetId = await getTargetIdFromNameCli(projectId, targetName);
    connect = await connectToTarget(targetId, sshUser, sshKeyPath);
    const sessionsPage = new SessionsPage(page);
    await sessionsPage.waitForSessionToBeVisible(targetName);
    await page
      .getByRole('cell', { name: targetName })
      .locator('..')
      .getByRole('button', { name: 'Cancel' })
      .click();
  } finally {
    if (orgId) {
      await deleteScopeCli(orgId);
    }
    // End `boundary connect` process
    if (connect) {
      connect.kill('SIGTERM');
    }
  }
});

test('Verify session created to target with address, then cancel the session @ce @aws @docker', async ({
  page,
  baseURL,
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
    const targetName = await targetsPage.createTargetWithAddress(targetAddress, targetPort);

    await authenticateBoundaryCli(
      baseURL,
      adminAuthMethodId,
      adminLoginName,
      adminPassword,
    );
    orgId = await getOrgIdFromNameCli(orgName);
    const projectId = await getProjectIdFromNameCli(orgId, projectName);
    const targetId = await getTargetIdFromNameCli(projectId, targetName);
    connect = await connectToTarget(targetId, sshUser, sshKeyPath);
    const sessionsPage = new SessionsPage(page);
    await sessionsPage.waitForSessionToBeVisible(targetName);
    await page
      .getByRole('cell', { name: targetName })
      .locator('..')
      .getByRole('button', { name: 'Cancel' })
      .click();
  } finally {
    if (orgId) {
      await deleteScopeCli(orgId);
    }
    // End `boundary connect` process
    if (connect) {
      connect.kill('SIGTERM');
    }
  }
});

test('Verify TCP target is updated @ce @aws @docker', async ({
  page,
  baseURL,
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
    await targetsPage.createTargetWithAddress(targetAddress, targetPort);

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
  } finally {
    await authenticateBoundaryCli(
      baseURL,
      adminAuthMethodId,
      adminLoginName,
      adminPassword,
    );
    const orgId = await getOrgIdFromNameCli(orgName);
    if (orgId) {
      await deleteScopeCli(orgId);
    }
  }
});
