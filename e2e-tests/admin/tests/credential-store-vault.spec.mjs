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
} from '../../helpers/boundary-cli.mjs';
import { checkVaultCli } from '../../helpers/vault-cli.mjs';
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

test('Vault Credential Store (User & Key Pair) @ce @aws @docker', async ({
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
    const targetName = await targetsPage.createTargetWithAddress(targetAddress, targetPort);
    const credentialStoresPage = new CredentialStoresPage(page);
    await credentialStoresPage.createVaultCredentialStore(vaultAddr, clientToken);

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
      baseURL,
      adminAuthMethodId,
      adminLoginName,
      adminPassword,
    );
    orgId = await getOrgIdFromNameCli(orgName);
    const projectId = await getProjectIdFromNameCli(orgId, projectName);
    const targetId = await getTargetIdFromNameCli(projectId, targetName);
    const session = await authorizeSessionByTargetIdCli(targetId);
    const retrievedUser =
      session.item.credentials[0].secret.decoded.data.username;
    const retrievedKey =
      session.item.credentials[0].secret.decoded.data.private_key;

    expect(retrievedUser).toBe(sshUser);

    const keyData = await readFile(sshKeyPath, {
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
