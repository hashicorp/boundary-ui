/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

/* eslint-disable no-undef */
const { test, expect } = require('@playwright/test');
const { execSync } = require('child_process');
const { nanoid } = require('nanoid');
const { checkEnv, authenticatedState } = require('../helpers/general');
const {
  authenticateBoundaryCli,
  checkBoundaryCli,
} = require('../helpers/boundary-cli');
const { checkVaultCli } = require('../helpers/vault-cli');
const {
  createNewOrg,
  createNewProject,
  createVaultCredentialStore,
  createNewHostCatalog,
  createNewHostSet,
  createNewHostInHostSet,
  createNewTarget,
  addHostSourceToTarget,
  addBrokeredCredentialsToTarget,
} = require('../helpers/boundary-ui');
const { readFile } = require('fs/promises');

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
  let org;
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

    const orgName = await createNewOrg(page);
    await authenticateBoundaryCli();
    const orgs = JSON.parse(execSync('boundary scopes list -format json'));
    org = orgs.items.filter((obj) => obj.name == orgName)[0];

    const projectName = await createNewProject(page);
    const projects = JSON.parse(
      execSync(`boundary scopes list -format json -scope-id ${org.id}`),
    );
    const project = projects.items.filter((obj) => obj.name == projectName)[0];

    await createNewHostCatalog(page);
    const hostSetName = await createNewHostSet(page);
    await createNewHostInHostSet(page);
    const targetName = await createNewTarget(page);
    await addHostSourceToTarget(page, hostSetName);
    const targets = JSON.parse(
      execSync(`boundary targets list -format json -scope-id ${project.id}`),
    );
    const target = targets.items.filter((obj) => obj.name == targetName)[0];

    await createVaultCredentialStore(page, clientToken);

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

    await addBrokeredCredentialsToTarget(
      page,
      targetName,
      credentialLibraryName,
    );

    const session = JSON.parse(
      execSync(
        `boundary targets authorize-session -id ${target.id} -format json`,
      ),
    );
    const retrievedUser =
      session.item.credentials[0].secret.decoded.data.username;
    const retrievedKey =
      session.item.credentials[0].secret.decoded.data.private_key;
    if (process.env.E2E_SSH_USER != retrievedUser) {
      throw new Error(
        'Stored User does not match. EXPECTED: ' +
          process.env.E2E_SSH_USER +
          ', ACTUAL: ' +
          retrievedUser,
      );
    }
    const keyData = await readFile(process.env.E2E_SSH_KEY_PATH, {
      encoding: 'utf-8',
    });
    if (keyData != retrievedKey) {
      throw new Error('Stored Key does not match');
    }
  } finally {
    if (org) {
      await deleteOrgCli(org.id);
    }
  }
});
