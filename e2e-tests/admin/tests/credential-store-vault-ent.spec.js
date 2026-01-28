/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect } from '@playwright/test';
import { test } from '../../global-setup.js';
import { execSync } from 'child_process';

import * as boundaryCli from '../../helpers/boundary-cli';
import * as vaultCli from '../../helpers/vault-cli';
import { CredentialStoresPage } from '../pages/credential-stores.js';
import { OrgsPage } from '../pages/orgs.js';
import { ProjectsPage } from '../pages/projects.js';
import { SessionsPage } from '../pages/sessions.js';
import { TargetsPage } from '../pages/targets.js';

const secretsPath = 'e2e_secrets';
const secretName = 'cred';
const secretPolicyName = 'kv-policy';
const boundaryPolicyName = 'boundary-controller';

test.beforeAll(async () => {
  await boundaryCli.checkBoundaryCli();
  await vaultCli.checkVaultCli();
});

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.afterEach(() => {
  execSync(`vault policy delete ${secretPolicyName}`);
  execSync(`vault policy delete ${boundaryPolicyName}`);
  execSync(`vault secrets disable ${secretsPath}`);
});

test(
  'Vault Credential Store (User & Key Pair)',
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
    vaultAddrPrivate,
    workerTagEgress,
  }) => {
    let orgId;
    let connect;
    try {
      const clientToken = await vaultCli.setupVaultCredentialStore(
        boundaryPolicyName,
        secretPolicyName,
        secretsPath,
        secretName,
        sshUser,
        sshKeyPath,
      );

      const orgsPage = new OrgsPage(page);
      const orgName = await orgsPage.createOrg();
      const projectsPage = new ProjectsPage(page);
      const projectName = await projectsPage.createProject();
      const targetsPage = new TargetsPage(page);
      const targetName = await targetsPage.createTarget({
        targetType: 'ssh',
        port: targetPort,
        address: targetAddress,
      });
      const credentialStoresPage = new CredentialStoresPage(page);
      await credentialStoresPage.createVaultCredentialStoreWithWorkerFilter(
        vaultAddrPrivate,
        clientToken,
        `"${workerTagEgress}" in "/tags/type"`,
      );
      const credentialLibraryName =
        await credentialStoresPage.createVaultGenericCredentialLibraryEnt(
          `${secretsPath}/data/${secretName}`,
          'SSH Private Key',
        );
      await targetsPage.addInjectedCredentialsToTarget(
        targetName,
        credentialLibraryName,
      );

      // Verify that session can be established
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
    } finally {
      if (connect) {
        connect.kill('SIGTERM');
      }

      if (orgId) {
        await boundaryCli.deleteScope(orgId);
      }
    }
  },
);

test(
  'Vault Credential Store - Username, Password & Domain credential type',
  { tag: ['@ent', '@aws', '@docker'] },
  async ({ page, sshUser, sshKeyPath, vaultAddrPrivate, workerTagEgress }) => {
    let orgId;
    try {
      // Set up Vault credential store
      const clientToken = await vaultCli.setupVaultCredentialStore(
        boundaryPolicyName,
        secretPolicyName,
        secretsPath,
        secretName,
        sshUser,
        sshKeyPath,
      );
      const orgsPage = new OrgsPage(page);
      await orgsPage.createOrg();
      const projectsPage = new ProjectsPage(page);
      await projectsPage.createProject();

      const credentialStoresPage = new CredentialStoresPage(page);
      await credentialStoresPage.createVaultCredentialStoreWithWorkerFilter(
        vaultAddrPrivate,
        clientToken,
        `"${workerTagEgress}" in "/tags/type"`,
      );

      const credentialLibraryName =
        await credentialStoresPage.createVaultGenericCredentialLibraryEnt(
          `${secretsPath}/data/${secretName}`,
          'Username, Password & Domain',
        );

      await expect(
        page
          .getByRole('navigation', { name: 'breadcrumbs' })
          .getByText(credentialLibraryName),
      ).toBeVisible();
    } finally {
      if (orgId) {
        await boundaryCli.deleteScope(orgId);
      }
    }
  },
);
