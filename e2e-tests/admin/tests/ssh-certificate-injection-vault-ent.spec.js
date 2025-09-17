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

const sshPolicyName = 'ssh-policy';
const boundaryPolicyName = 'boundary-controller';
// This must match the secret path in ssh-policy.hcl
const secretsPath = 'e2e_secrets';
// This must match the secret name in ssh-policy.hcl
const secretName = 'boundary-client';

test.beforeAll(async () => {
  await boundaryCli.checkBoundaryCli();
  await vaultCli.checkVaultCli();
});

test.afterEach(async () => {
  execSync(`vault secrets disable ${secretsPath}`);
  execSync(`vault policy delete ${sshPolicyName}`);
  execSync(`vault policy delete ${boundaryPolicyName}`);
});

test(
  'SSH Certificate Injection',
  { tag: ['@ent', '@docker'] },
  async ({
    page,
    controllerAddr,
    adminAuthMethodId,
    adminLoginName,
    adminPassword,
    sshUser,
    sshCaKey,
    sshCaKeyPublic,
    targetAddress,
    targetPort,
    vaultAddr,
  }) => {
    await page.goto('/');
    let orgId;
    let connect;
    try {
      // Set up vault
      execSync(
        `vault policy write ${boundaryPolicyName} ./admin/tests/fixtures/boundary-controller-policy.hcl`,
      );
      execSync(`vault secrets enable -path=${secretsPath} ssh`);
      execSync(
        `vault policy write ${sshPolicyName} ./admin/tests/fixtures/ssh-policy.hcl`,
      );
      execSync(
        `vault write ${secretsPath}/roles/${secretName} @./admin/tests/fixtures/ssh-certificate-injection-role.json`,
      );

      const private_key = Buffer.from(sshCaKey, 'base64');
      const public_key = Buffer.from(sshCaKeyPublic, 'base64');

      execSync(
        `vault write ${secretsPath}/config/ca` +
          ` private_key="${private_key}"` +
          ` public_key="${public_key}"` +
          ` generate_signing_key=false`,
        ` format=json`,
      );

      const vaultToken = JSON.parse(
        execSync(
          `vault token create` +
            ` -no-default-policy=true` +
            ` -policy=${boundaryPolicyName}` +
            ` -policy=${sshPolicyName}` +
            ` -orphan=true` +
            ` -period=20m` +
            ` -renewable=true` +
            ` -format=json`,
        ),
      );
      const clientToken = vaultToken.auth.client_token;

      // Create org
      const orgsPage = new OrgsPage(page);
      const orgName = await orgsPage.createOrg();

      // Create project
      const projectsPage = new ProjectsPage(page);
      const projectName = await projectsPage.createProject();

      // Create target
      const targetsPage = new TargetsPage(page);
      const targetName = await targetsPage.createTarget(
        'ssh',
        targetPort,
        targetAddress,
      );

      // Create credentials
      const credentialStoresPage = new CredentialStoresPage(page);
      await credentialStoresPage.createVaultCredentialStore(
        vaultAddr,
        clientToken,
      );
      const credentialLibraryName =
        await credentialStoresPage.createVaultSshCertificateCredentialLibraryEnt(
          `${secretsPath}/issue/${secretName}`,
          sshUser,
        );
      await targetsPage.addInjectedCredentialsToTarget(
        targetName,
        credentialLibraryName,
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
    } finally {
      // End `boundary connect` process
      if (connect) {
        connect.kill('SIGTERM');
      }

      if (orgId) {
        await boundaryCli.deleteScope(orgId);
      }
    }
  },
);
