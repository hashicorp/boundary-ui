/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import { nanoid } from 'nanoid';
import { readFile } from 'fs/promises';

import { authenticatedState } from '../global-setup.mjs';
import { checkEnv } from '../helpers/general.mjs';
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

test('Vault Credential Store (User & Key Pair) @ce @aws @docker', async ({
  page,
}) => {
  let orgId;
  try {
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

    const orgsPage = new OrgsPage(page);
    const orgName = await orgsPage.createOrg();
    const projectsPage = new ProjectsPage(page);
    const projectName = await projectsPage.createProject();
    const targetsPage = new TargetsPage(page);
    const targetName = await targetsPage.createTargetWithAddress(
      process.env.E2E_TARGET_ADDRESS,
      process.env.E2E_TARGET_PORT,
    );
    const credentialStoresPage = new CredentialStoresPage(page);
    await credentialStoresPage.createVaultCredentialStore(
      process.env.E2E_VAULT_ADDR,
      clientToken,
    );

    const credentialLibraryName = 'Credential Library ' + nanoid();
    await page.getByRole('link', { name: 'Credential Libraries' }).click();
    await page.getByRole('link', { name: 'New', exact: true }).click();
    await page
      .getByLabel('Name (Optional)', { exact: true })
      .fill(credentialLibraryName);
    await page
      .getByLabel('Description (Optional)')
      .fill('This is an automated test');
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

    await authenticateBoundaryCli(
      process.env.BOUNDARY_ADDR,
      process.env.E2E_PASSWORD_AUTH_METHOD_ID,
      process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
      process.env.E2E_PASSWORD_ADMIN_PASSWORD,
    );
    orgId = await getOrgIdFromNameCli(orgName);
    const projectId = await getProjectIdFromNameCli(orgId, projectName);
    const targetId = await getTargetIdFromNameCli(projectId, targetName);
    const session = await authorizeSessionByTargetIdCli(targetId);
    const retrievedUser =
      session.item.credentials[0].secret.decoded.data.username;
    const retrievedKey =
      session.item.credentials[0].secret.decoded.data.private_key;

    expect(retrievedUser).toBe(process.env.E2E_SSH_USER);

    const keyData = await readFile(process.env.E2E_SSH_KEY_PATH, {
      encoding: 'utf-8',
    });
    if (keyData != retrievedKey) {
      throw new Error('Stored Key does not match');
    }
  } finally {
    if (orgId) {
      await deleteScopeCli(orgId);
    }
  }
});
