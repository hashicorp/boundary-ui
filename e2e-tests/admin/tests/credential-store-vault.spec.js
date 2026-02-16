/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../../global-setup.js';
import { expect } from '@playwright/test';
import { execSync } from 'child_process';
import { nanoid } from 'nanoid';
import { readFile } from 'fs/promises';

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
    vaultAddr,
  }) => {
    let orgId;
    try {
      execSync(
        `vault policy write ${boundaryPolicyName} ./admin/tests/fixtures/boundary-controller-policy.hcl`,
      );
      execSync(`vault secrets enable -path=${secretsPath} kv-v2`);
      execSync(
        `vault kv put -mount ${secretsPath} ${secretName} ` +
          ` username=${sshUser}` +
          ` private_key=@${sshKeyPath}`,
      );
      execSync(
        `vault policy write ${secretPolicyName} ./admin/tests/fixtures/kv-policy.hcl`,
      );
      const vaultToken = JSON.parse(
        execSync(
          `vault token create` +
            ` -no-default-policy=true` +
            ` -policy=${boundaryPolicyName}` +
            ` -policy=${secretPolicyName}` +
            ` -orphan=true` +
            ` -period=20m` +
            ` -renewable=true` +
            ` -format=json`,
        ),
      );
      const clientToken = vaultToken.auth.client_token;

      const orgsPage = new OrgsPage(page);
      const orgName = await orgsPage.createOrg();
      const projectsPage = new ProjectsPage(page);
      const projectName = await projectsPage.createProject();
      const targetsPage = new TargetsPage(page);
      const targetName = await targetsPage.createTarget({
        port: targetPort,
        address: targetAddress,
      });
      const credentialStoresPage = new CredentialStoresPage(page);
      await credentialStoresPage.createVaultCredentialStore(
        vaultAddr,
        clientToken,
      );

      const credentialLibraryName = 'Credential Library ' + nanoid();
      await page.getByRole('link', { name: 'Credential Libraries' }).click();
      await page.getByRole('link', { name: 'New', exact: true }).click();
      await page
        .getByLabel('Name', { exact: true })
        .fill(credentialLibraryName);
      await page.getByLabel('Description').fill('This is an automated test');
      await page
        .getByLabel('Vault Path')
        .fill(`${secretsPath}/data/${secretName}`);
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(
        page.getByRole('alert').getByText('Success', { exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Dismiss' }).click();

      await targetsPage.addBrokeredCredentialsToTarget(
        targetName,
        credentialLibraryName,
      );

      // Verify correct credentials are returned after authorizing session
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
      const session = await boundaryCli.authorizeSessionByTargetId(targetId);
      const retrievedUser =
        session.item.credentials[0].secret.decoded.data.username;
      const retrievedKey =
        session.item.credentials[0].secret.decoded.data.private_key;

      expect(retrievedUser).toBe(sshUser);
      const keyData = await readFile(sshKeyPath, {
        encoding: 'utf-8',
      });
      expect(retrievedKey).toBe(keyData);

      const sessionsPage = new SessionsPage(page);
      await sessionsPage.waitForSessionToBeVisible(targetName);
    } finally {
      if (orgId) {
        await boundaryCli.deleteScope(orgId);
      }
    }
  },
);
