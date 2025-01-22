/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect, test } from '../fixtures/baseTest.js';
import * as boundaryHttp from '../../helpers/boundary-http.js';
import { execSync } from 'child_process';
import * as vaultCli from '../../helpers/vault-cli';

let org;
let targetWithBrokeredVaultCredentials;
let targetWithBrokeredStaticCredentials;
let sshPrivateKeyCredential;
let jsonCredential;
let credentialLibrary;
const secretPolicyName = 'kv-policy';
const boundaryPolicyName = 'boundary-controller';
const secretsPath = 'e2e_secrets';
const secretName = 'cred';

test.beforeAll(async () => {
  await vaultCli.checkVaultCli();
});

test.beforeEach(
  async ({
    request,
    targetAddress,
    targetPort,
    sshUser,
    sshKeyPath,
    vaultAddr,
    page,
  }) => {
    execSync(`vault policy delete ${secretPolicyName}`);
    execSync(`vault policy delete ${boundaryPolicyName}`);
    execSync(`vault secrets disable ${secretsPath}`);

    await page.goto('/');

    org = await boundaryHttp.createOrg(request);
    const project = await boundaryHttp.createProject(request, org.id);

    // Create host set
    const hostCatalog = await boundaryHttp.createStaticHostCatalog(
      request,
      project.id,
    );
    const host = await boundaryHttp.createHost(request, {
      hostCatalogId: hostCatalog.id,
      address: targetAddress,
    });

    const hostSet = await boundaryHttp.createHostSet(request, hostCatalog.id);
    await boundaryHttp.addHostToHostSet(request, {
      hostSet,
      hostIds: [host.id],
    });

    // Create a static credential store and key pair credential
    const credentialStore = await boundaryHttp.createStaticCredentialStore(
      request,
      project.id,
    );
    sshPrivateKeyCredential = await boundaryHttp.createStaticCredentialKeyPair(
      request,
      {
        credentialStoreId: credentialStore.id,
        username: sshUser,
        sshKeyPath,
      },
    );

    // Create a static credential store and json credential
    jsonCredential = await boundaryHttp.createStaticCredentialJson(request, {
      credentialStoreId: credentialStore.id,
      data: {
        nested: {
          key1: 'value1',
          key2: 'value2',
        },
      },
    });

    // Create Vault token and apply policies
    execSync(
      `vault policy write ${boundaryPolicyName} ./desktop/fixtures/boundary-controller-policy.hcl`,
    );
    execSync(`vault secrets enable -path=${secretsPath} kv-v2`);
    execSync(
      `vault kv put -mount ${secretsPath} ${secretName} ` +
        ` password=${String.raw`pass\\word`}`,
      {
        encoding: 'utf-8',
      },
    );

    execSync(
      `vault policy write ${secretPolicyName} ./desktop/fixtures/kv-policy.hcl`,
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

    // Create a vault credential store and generic secrets type credential library
    const vaultCredentialStore = await boundaryHttp.createVaultCredentialStore(
      request,
      project.id,
      vaultAddr,
      clientToken,
    );
    credentialLibrary = await boundaryHttp.createVaultCredentialGenericSecret(
      request,
      {
        credentialStoreId: vaultCredentialStore.id,
        vaultPath: `${secretsPath}/data/${secretName}`,
      },
    );

    // Create a tcp target with vault brokered credential Libraries
    targetWithBrokeredVaultCredentials = await boundaryHttp.createTarget(
      request,
      {
        scopeId: project.id,
        type: 'tcp',
        port: targetPort,
      },
    );
    targetWithBrokeredVaultCredentials = await boundaryHttp.addHostSource(
      request,
      {
        target: targetWithBrokeredVaultCredentials,
        hostSourceIds: [hostSet.id],
      },
    );
    targetWithBrokeredVaultCredentials =
      await boundaryHttp.addBrokeredCredentials(request, {
        target: targetWithBrokeredVaultCredentials,
        credentialIds: [credentialLibrary.id],
      });

    // Create a tcp target with static brokered credentials
    targetWithBrokeredStaticCredentials = await boundaryHttp.createTarget(
      request,
      {
        scopeId: project.id,
        type: 'tcp',
        port: targetPort,
      },
    );
    targetWithBrokeredStaticCredentials = await boundaryHttp.addHostSource(
      request,
      {
        target: targetWithBrokeredStaticCredentials,
        hostSourceIds: [hostSet.id],
      },
    );
    targetWithBrokeredStaticCredentials =
      await boundaryHttp.addBrokeredCredentials(request, {
        target: targetWithBrokeredStaticCredentials,
        credentialIds: [sshPrivateKeyCredential.id, jsonCredential.id],
      });
  },
);

test.afterEach(async ({ request }) => {
  if (org) {
    await boundaryHttp.deleteOrg(request, org.id);
  }
});

test.describe('Credential tests', async () => {
  test('Vault brokered Credentials are displayed as expected', async ({
    authedPage,
  }) => {
    await authedPage
      .getByRole('link', { name: targetWithBrokeredVaultCredentials.name })
      .click();
    await authedPage.getByRole('button', { name: 'Connect' }).click();
    await expect(
      authedPage.getByRole('heading', { name: 'Sessions' }),
    ).toBeVisible();

    await expect(authedPage.getByText(credentialLibrary.name)).toBeVisible();
    await expect(authedPage.getByText('password')).toBeVisible();

    await authedPage
      .getByRole('listitem')
      .filter({ hasText: 'password' })
      .getByLabel('Toggle secret visibility')
      .click();
    await expect(
      authedPage
        .getByRole('listitem')
        .filter({ hasText: 'password' })
        .locator('pre'),
    ).toHaveText(String.raw`pass\word`);

    await authedPage.getByRole('button', { name: 'End Session' }).click();
    await expect(authedPage.getByText('Canceled successfully.')).toBeVisible();
    await expect(
      authedPage.getByRole('heading', { name: 'Targets' }),
    ).toBeVisible();
  });

  test('Static JSON brokered Credentials are displayed as expected', async ({
    authedPage,
  }) => {
    await authedPage
      .getByRole('link', { name: targetWithBrokeredStaticCredentials.name })
      .click();
    await authedPage.getByRole('button', { name: 'Connect' }).click();

    await expect(
      authedPage.getByRole('heading', { name: 'Sessions' }),
    ).toBeVisible();

    // JSON credential with nested keys
    await expect(authedPage.getByText(jsonCredential.name)).toBeVisible();
    await expect(authedPage.getByText('nested.key1')).toBeVisible();
    await expect(authedPage.getByText('nested.key2')).toBeVisible();
    await authedPage
      .getByRole('listitem')
      .filter({ hasText: 'nested.key1' })
      .getByLabel('Toggle secret visibility')
      .click();
    await expect(
      authedPage
        .getByRole('listitem')
        .filter({ hasText: 'nested.key1' })
        .locator('pre'),
    ).toHaveText('value1');
    await authedPage
      .getByRole('listitem')
      .filter({ hasText: 'nested.key2' })
      .getByLabel('Toggle secret visibility')
      .click();
    await expect(
      authedPage
        .getByRole('listitem')
        .filter({ hasText: 'nested.key2' })
        .locator('pre'),
    ).toHaveText('value2');

    // SSH private key credential
    await expect(
      authedPage.getByText(sshPrivateKeyCredential.name),
    ).toBeVisible();
    await expect(authedPage.getByText('private_key')).toBeVisible();
    await expect(authedPage.getByText('username')).toBeVisible();
    await authedPage
      .getByRole('listitem')
      .filter({ hasText: 'username' })
      .getByLabel('Toggle secret visibility')
      .click();
    await expect(
      authedPage
        .getByRole('listitem')
        .filter({ hasText: 'username' })
        .locator('pre'),
    ).toHaveText(sshPrivateKeyCredential.attributes.username);
    await authedPage
      .getByRole('listitem')
      .filter({ hasText: 'private_key' })
      .getByLabel('Toggle secret visibility')
      .click();
    await expect(
      authedPage
        .getByRole('listitem')
        .filter({ hasText: 'private_key' })
        .locator('pre'),
    ).toContainText(/BEGIN (OPENSSH|RSA) PRIVATE KEY/);
  });
});
