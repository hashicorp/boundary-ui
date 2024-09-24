/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../playwright.config.mjs'
import { expect } from '@playwright/test';
import { execSync } from 'child_process';
import { nanoid } from 'nanoid';
import { readFile } from 'fs/promises';

import { authenticatedState } from '../global-setup.mjs';
import {
  authenticateBoundaryCli,
  authorizeSessionByTargetIdCli,
  checkBoundaryCli,
  deleteScopeCli,
  getOrgIdFromNameCli,
  getProjectIdFromNameCli,
  getTargetIdFromNameCli,
} from '../helpers/boundary-cli.mjs';
import { checkVaultCli } from '../helpers/vault-cli.mjs';
import { CredentialStoresPage } from '../pages/credential-stores.mjs';
import { OrgsPage } from '../pages/orgs.mjs';
import { ProjectsPage } from '../pages/projects.mjs';
import { TargetsPage } from '../pages/targets.mjs';

const secretsPath = 'e2e_secrets';
const secretName = 'cred';
const secretPolicyName = 'kv-policy';
const boundaryPolicyName = 'boundary-controller';

test.use({ storageState: authenticatedState });

test.beforeAll(async () => {
  await checkBoundaryCli();
  await checkVaultCli();
});

test.beforeEach(async ({ page }) => {
  execSync(`vault policy delete ${secretPolicyName}`);
  execSync(`vault policy delete ${boundaryPolicyName}`);
  execSync(`vault secrets disable ${secretsPath}`);

  await page.goto('/');
});

test('Vault Credential Store (User & Key Pair) @ent @aws @docker', async ({
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
  try {
    execSync(
      `vault policy write ${boundaryPolicyName} ./tests/e2e/tests/fixtures/boundary-controller-policy.hcl`,
    );
    execSync(`vault secrets enable -path=${secretsPath} kv-v2`);
    execSync(
      `vault kv put -mount ${secretsPath} ${secretName} ` +
      ` username=${sshUser}` +
      ` private_key=@${sshKeyPath}`,
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

    const orgsPage = new OrgsPage(page);
    const orgName = await orgsPage.createOrg();
    const projectsPage = new ProjectsPage(page);
    const projectName = await projectsPage.createProject();
    const targetsPage = new TargetsPage(page);
    const targetName = await targetsPage.createSshTargetWithAddressEnt(targetAddress, targetPort);
    const credentialStoresPage = new CredentialStoresPage(page);
    await credentialStoresPage.createVaultCredentialStore(vaultAddr, clientToken);
    const credentialLibraryName = await credentialStoresPage.createVaultGenericCredentialLibraryEnt(
      `${secretsPath}/data/${secretName}`,
      'SSH Private Key',
    )
    await targetsPage.addInjectedCredentialsToTarget(
      targetName,
      credentialLibraryName,
    );

    await authenticateBoundaryCli(
      baseURL,
      adminAuthMethodId,
      adminLoginName,
      adminPassword,
    );
    orgId = await getOrgIdFromNameCli(orgName);
    const projectId = await getProjectIdFromNameCli(orgId, projectName);
    const targetId = await getTargetIdFromNameCli(projectId, targetName);
    await authorizeSessionByTargetIdCli(targetId);
  } finally {
    if (orgId) {
      await deleteScopeCli(orgId);
    }
  }
});
