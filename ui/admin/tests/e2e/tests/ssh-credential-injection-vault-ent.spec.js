/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '@playwright/test';
import { execSync } from 'child_process';

import { authenticatedState } from '../global-setup';
import { checkEnv } from '../helpers/general';
import {
  authenticateBoundaryCli,
  checkBoundaryCli,
  connectSshToTarget,
  deleteScopeCli,
  getOrgIdFromNameCli,
  getProjectIdFromNameCli,
  getTargetIdFromNameCli,
} from '../helpers/boundary-cli';
import { checkVaultCli } from '../helpers/vault-cli';
import { CredentialStoresPage } from '../pages/credential-stores';
import { OrgsPage } from '../pages/orgs';
import { ProjectsPage } from '../pages/projects';
import { SessionsPage } from '../pages/sessions';
import { TargetsPage } from '../pages/targets';

const secretsPath = 'e2e_secrets';
const secretName = 'cred';
const secretPolicyName = 'kv-policy';
const boundaryPolicyName = 'boundary-controller';

test.use({ storageState: authenticatedState });

test.beforeAll(async () => {
  await checkEnv([
    'VAULT_ADDR', // Address used by Vault CLI
    'VAULT_TOKEN',
    'E2E_VAULT_ADDR', // Address used by Boundary Server (could be different from VAULT_ADDR depending on network config (i.e. docker network))
    'E2E_TARGET_ADDRESS',
    'E2E_SSH_USER',
    'E2E_SSH_KEY_PATH',
  ]);

  await checkBoundaryCli();
  await checkVaultCli();
});

test.beforeEach(async ({ page }) => {
  execSync(`vault policy delete ${secretPolicyName}`);
  execSync(`vault policy delete ${boundaryPolicyName}`);
  execSync(`vault secrets disable ${secretsPath}`);

  await page.goto('/');
});

test('SSH Credential Injection (Vault User & Key Pair) @ent @docker', async ({
  page,
}) => {
  let orgId;
  let connect;
  try {
    // Set up vault
    execSync(
      `vault policy write ${boundaryPolicyName} ./tests/e2e/tests/fixtures/boundary-controller-policy.hcl`,
    );
    execSync(`vault secrets enable -path=${secretsPath} kv-v2`);
    execSync(
      `vault kv put -mount ${secretsPath} ${secretName} ` +
        ` username=${process.env.E2E_SSH_USER}` +
        ` private_key=@${process.env.E2E_SSH_KEY_PATH}`,
    );
    execSync(
      `vault policy write ${secretPolicyName} ./tests/e2e/tests/fixtures/kv-policy.hcl`,
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
      process.env.E2E_TARGET_ADDRESS,
      process.env.E2E_TARGET_PORT,
    );

    // Create credentials
    const credentialStoresPage = new CredentialStoresPage(page);
    await credentialStoresPage.createVaultCredentialStore(
      process.env.E2E_VAULT_ADDR,
      clientToken,
    );
    const credentialLibraryName =
      await credentialStoresPage.createVaultGenericCredentialLibrary(
        `${secretsPath}/data/${secretName}`,
        'SSH Private Key',
      );
    await targetsPage.addInjectedCredentialsToTarget(
      targetName,
      credentialLibraryName,
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
