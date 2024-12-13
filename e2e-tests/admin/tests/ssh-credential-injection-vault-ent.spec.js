/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test, authenticatedState } from '../../global-setup.js';
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

test.use({ storageState: authenticatedState });

test.beforeAll(async () => {
  await boundaryCli.checkBoundaryCli();
  await vaultCli.checkVaultCli();
});

test.beforeEach(async ({ page }) => {
  execSync(`vault policy delete ${secretPolicyName}`);
  execSync(`vault policy delete ${boundaryPolicyName}`);
  execSync(`vault secrets disable ${secretsPath}`);

  await page.goto('/');
});

test('SSH Credential Injection (Vault User & Key Pair) @ent @docker', async ({
  page,
  baseURL,
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
  let connect;
  try {
    // Set up vault
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

    // Create org
    const orgsPage = new OrgsPage(page);
    const orgName = await orgsPage.createOrg();

    // Create project
    const projectsPage = new ProjectsPage(page);
    const projectName = await projectsPage.createProject();

    // Create target
    const targetsPage = new TargetsPage(page);
    const targetName = await targetsPage.createSshTargetWithAddressEnt(
      targetAddress,
      targetPort,
    );

    // Create credentials
    const credentialStoresPage = new CredentialStoresPage(page);
    await credentialStoresPage.createVaultCredentialStore(
      vaultAddr,
      clientToken,
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

    // Connect to target
    await boundaryCli.authenticateBoundaryCli(
      baseURL,
      adminAuthMethodId,
      adminLoginName,
      adminPassword,
    );
    orgId = await boundaryCli.getOrgIdFromNameCli(orgName);
    const projectId = await boundaryCli.getProjectIdFromNameCli(
      orgId,
      projectName,
    );
    const targetId = await boundaryCli.getTargetIdFromNameCli(
      projectId,
      targetName,
    );
    connect = await boundaryCli.connectSshToTarget(targetId);
    const sessionsPage = new SessionsPage(page);
    await sessionsPage.waitForSessionToBeVisible(targetName);
    await page
      .getByRole('cell', { name: targetName })
      .locator('..')
      .getByRole('button', { name: 'Cancel' })
      .click();
  } finally {
    if (orgId) {
      await boundaryCli.deleteScopeCli(orgId);
    }
    // End `boundary connect` process
    if (connect) {
      connect.kill('SIGTERM');
    }
  }
});
