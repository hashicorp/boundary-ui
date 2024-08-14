/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test, expect } from '@playwright/test';

import { authenticatedState } from '../global-setup';
import { checkEnv } from '../helpers/general';
import {
  authenticateBoundaryCli,
  checkBoundaryCli,
  connectToTarget,
  connectSshToTarget,
  deleteScopeCli,
  getOrgIdFromNameCli,
  getProjectIdFromNameCli,
  getTargetIdFromNameCli,
} from '../helpers/boundary-cli';
import { CredentialStoresPage } from '../pages/credential-stores';
import { HostCatalogsPage } from '../pages/host-catalogs';
import { OrgsPage } from '../pages/orgs';
import { ProjectsPage } from '../pages/projects';
import { SessionsPage } from '../pages/sessions';
import { TargetsPage } from '../pages/targets';

test.use({ storageState: authenticatedState });

test.beforeAll(async () => {
  await checkEnv([
    'E2E_SSH_USER',
    'E2E_SSH_KEY_PATH',
    'E2E_TARGET_ADDRESS',
    'E2E_TARGET_PORT',
  ]);

  await checkBoundaryCli();
});

test('Verify session created for TCP target @ent @aws @docker', async ({
  page,
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
    const targetName = await targetsPage.createTcpTargetWithAddressEnt(
      process.env.E2E_TARGET_ADDRESS,
      process.env.E2E_TARGET_PORT,
    );

    await authenticateBoundaryCli(
      process.env.BOUNDARY_ADDR,
      process.env.E2E_PASSWORD_AUTH_METHOD_ID,
      process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
      process.env.E2E_PASSWORD_ADMIN_PASSWORD,
    );
    orgId = await getOrgIdFromNameCli(orgName);
    const projectId = await getProjectIdFromNameCli(orgId, projectName);
    const targetId = await getTargetIdFromNameCli(projectId, targetName);
    connect = await connectToTarget(
      targetId,
      process.env.E2E_SSH_USER,
      process.env.E2E_SSH_KEY_PATH,
    );
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

test('Verify session created for SSH target @ent @aws @docker', async ({
  page,
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
    const targetName = await targetsPage.createSshTargetWithAddressEnt(
      process.env.E2E_TARGET_ADDRESS,
      process.env.E2E_TARGET_PORT,
    );
    const credentialStoresPage = new CredentialStoresPage(page);
    await credentialStoresPage.createStaticCredentialStore();
    const credentialName =
      await credentialStoresPage.createStaticCredentialKeyPair(
        process.env.E2E_SSH_USER,
        process.env.E2E_SSH_KEY_PATH,
      );
    await targetsPage.addInjectedCredentialsToTarget(
      targetName,
      credentialName,
    );

    await authenticateBoundaryCli(
      process.env.BOUNDARY_ADDR,
      process.env.E2E_PASSWORD_AUTH_METHOD_ID,
      process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
      process.env.E2E_PASSWORD_ADMIN_PASSWORD,
    );
    orgId = await getOrgIdFromNameCli(orgName);
    const projectId = await getProjectIdFromNameCli(orgId, projectName);
    const targetId = await getTargetIdFromNameCli(projectId, targetName);
    connect = await connectSshToTarget(targetId);
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

test('SSH target with host sources @ent @aws @docker', async ({ page }) => {
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
    await hostCatalogsPage.createHostInHostSet(process.env.E2E_TARGET_ADDRESS);

    // Create another host set
    await page
      .getByRole('navigation', { name: 'Resources' })
      .getByRole('link', { name: 'Host Catalogs' })
      .click();
    await page.getByRole('link', { name: hostCatalogName }).click();
    const hostSetName2 = await hostCatalogsPage.createHostSet();

    // Create target
    const targetsPage = new TargetsPage(page);
    const targetName = await targetsPage.createSshTargetEnt(
      process.env.E2E_TARGET_PORT,
    );
    await targetsPage.addHostSourceToTarget(hostSetName);

    // Add/Remove another host source
    await targetsPage.addHostSourceToTarget(hostSetName2);
    await page
      .getByRole('link', { name: hostSetName2 })
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

    // Create credentials and attach to target
    const credentialStoresPage = new CredentialStoresPage(page);
    await credentialStoresPage.createStaticCredentialStore();
    const credentialName =
      await credentialStoresPage.createStaticCredentialKeyPair(
        process.env.E2E_SSH_USER,
        process.env.E2E_SSH_KEY_PATH,
      );
    await targetsPage.addInjectedCredentialsToTarget(
      targetName,
      credentialName,
    );

    // Connect to target
    await authenticateBoundaryCli(
      process.env.BOUNDARY_ADDR,
      process.env.E2E_PASSWORD_AUTH_METHOD_ID,
      process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
      process.env.E2E_PASSWORD_ADMIN_PASSWORD,
    );
    orgId = await getOrgIdFromNameCli(orgName);
    const projectId = await getProjectIdFromNameCli(orgId, projectName);
    const targetId = await getTargetIdFromNameCli(projectId, targetName);
    connect = await connectSshToTarget(targetId);
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
