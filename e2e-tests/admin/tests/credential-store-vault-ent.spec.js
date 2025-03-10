/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

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
      const targetName = await targetsPage.createSshTargetWithAddressEnt(
        targetAddress,
        targetPort,
      );
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
