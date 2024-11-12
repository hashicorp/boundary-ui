/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../playwright.config.js'
import { expect } from '@playwright/test';
import { execSync } from 'child_process';

import { authenticatedState } from '../global-setup.js';
import {
  authenticateBoundaryCli,
  checkBoundaryCli,
  connectSshToTarget,
  deleteScopeCli,
  getOrgIdFromNameCli,
  getProjectIdFromNameCli,
  getTargetIdFromNameCli,
} from '../../helpers/boundary-cli.js';
import { checkVaultCli } from '../../helpers/vault-cli.js';
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

test.use({ storageState: authenticatedState });

test.beforeAll(async () => {
  await checkBoundaryCli();
  await checkVaultCli();
});

test.beforeEach(async () => {
  execSync(`vault secrets disable ${secretsPath}`);
});

test('SSH Certificate Injection @ent @docker', async ({
  page,
  baseURL,
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

    const private_key = atob(sshCaKey);
    const public_key = atob(sshCaKeyPublic);

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
    const targetName = await targetsPage.createSshTargetWithAddressEnt(targetAddress, targetPort);

    // Create credentials
    const credentialStoresPage = new CredentialStoresPage(page);
    await credentialStoresPage.createVaultCredentialStore(vaultAddr, clientToken);
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
    await authenticateBoundaryCli(
      baseURL,
      adminAuthMethodId,
      adminLoginName,
      adminPassword,
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

    execSync(`vault secrets disable ${secretsPath}`);
    execSync(`vault policy delete ${sshPolicyName}`);
    execSync(`vault policy delete ${boundaryPolicyName}`);
  }
});
