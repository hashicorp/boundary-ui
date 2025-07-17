/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../../global-setup.js';
import { expect } from '@playwright/test';

import * as boundaryCli from '../../helpers/boundary-cli';
import { CredentialStoresPage } from '../pages/credential-stores.js';
import { HostCatalogsPage } from '../pages/host-catalogs.js';
import { OrgsPage } from '../pages/orgs.js';
import { ProjectsPage } from '../pages/projects.js';
import { SessionsPage } from '../pages/sessions.js';
import { TargetsPage } from '../pages/targets.js';

test.beforeAll(async () => {
  await boundaryCli.checkBoundaryCli();
});

test(
  'Verify session created for TCP target',
  { tag: ['@ent', '@aws', '@docker'] },
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
      const targetName = await targetsPage.createTcpTargetWithAddressEnt(
        targetAddress,
        targetPort,
      );

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
  'Verify session created for SSH target',
  { tag: ['@ent', '@aws', '@docker'] },
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
      const targetName = await targetsPage.createSshTargetWithAddressEnt(
        targetAddress,
        targetPort,
      );
      const credentialStoresPage = new CredentialStoresPage(page);
      await credentialStoresPage.createStaticCredentialStore();
      const credentialName =
        await credentialStoresPage.createStaticCredentialKeyPair(
          sshUser,
          sshKeyPath,
        );
      await targetsPage.addInjectedCredentialsToTarget(
        targetName,
        credentialName,
      );

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
      connect = await boundaryCli.connectSshToTarget(targetId);
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
  'SSH target with host sources',
  { tag: ['@ent', '@aws', '@docker'] },
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
      await page.getByRole('link', { name: hostCatalogName }).click();
      const hostSetName2 = await hostCatalogsPage.createHostSet();

      // Create target
      const targetsPage = new TargetsPage(page);
      const targetName = await targetsPage.createSshTargetEnt(targetPort);
      await targetsPage.addHostSourceToTarget(hostSetName);

      // Add/Remove another host source
      await targetsPage.addHostSourceToTarget(hostSetName2);
      await page
        .getByRole('row')
        .filter({ has: page.getByRole('link', { name: hostSetName2 }) })
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
          sshUser,
          sshKeyPath,
        );
      await targetsPage.addInjectedCredentialsToTarget(
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
      orgId = await boundaryCli.getOrgIdFromName(orgName);
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
  'Verify RDP target creation',
  { tag: ['@ent', '@aws', '@docker'] },
  async ({
    page,
    controllerAddr,
    adminAuthMethodId,
    adminLoginName,
    adminPassword,
    sshUser,
    targetAddress,
    targetPort,
  }) => {
    await page.goto('/');
    let orgId;
    try {
      const orgsPage = new OrgsPage(page);
      const orgName = await orgsPage.createOrg();
      const projectsPage = new ProjectsPage(page);
      await projectsPage.createProject();

      // Create host set
      const hostCatalogsPage = new HostCatalogsPage(page);
      const hostCatalogName = await hostCatalogsPage.createHostCatalog();
      const hostSetName = await hostCatalogsPage.createHostSet();
      await hostCatalogsPage.createHostInHostSet(targetAddress);

      // Create another host set
      await page.getByRole('link', { name: hostCatalogName }).click();
      const hostSetName2 = await hostCatalogsPage.createHostSet();

      // Create target
      const targetsPage = new TargetsPage(page);
      const targetName = await targetsPage.createRdpTargetEnt(targetPort);
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
        await credentialStoresPage.createStaticCredentialUsernamePassword(
          sshUser,
          'testPassword',
        );
      await targetsPage.addInjectedCredentialsToTarget(
        targetName,
        credentialName,
      );

      // Verify that an RDP target is created
      await boundaryCli.authenticateBoundary(
        controllerAddr,
        adminAuthMethodId,
        adminLoginName,
        adminPassword,
      );
      orgId = await boundaryCli.getOrgIdFromName(orgName);

      // TODO: Connection will be tested later when we have the Proxy in place.
      // For now, we just check if we can see the target in the UI
      await expect(page.getByRole('link', { name: targetName })).toBeVisible();
    } finally {
      if (orgId) {
        await boundaryCli.deleteScope(orgId);
      }
    }
  },
);
