/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */
import path from 'path';
import { expect, test } from '../fixtures/baseTest.js';
import * as boundaryHttp from '../../helpers/boundary-http.js';
import { spawnSync, execSync } from 'child_process';
import * as vaultCli from '../../helpers/vault-cli';

let org;
let targetWithBrokeredVaultCredentials;
let targetWithBrokeredStaticCredentials;
let sshPrivateKeyCredential;
let jsonCredential;
let vaultGenericCredentialLibrary;

// config for vault setup
const secretPolicyName = 'kv-policy';
const boundaryPolicyName = 'boundary-controller';
const secretsPath = 'e2e_secrets';
const secretName = 'cred';
const __dirname = import.meta.dirname;
const boundaryControllerPath = path.resolve(
  __dirname,
  '../../admin/tests/fixtures/boundary-controller-policy.hcl',
);
const kvPolicyPath = path.resolve(
  __dirname,
  '../../admin/tests/fixtures/kv-policy.hcl',
);

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
  }) => {
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

    // Create a static credential store
    const credentialStore = await boundaryHttp.createStaticCredentialStore(
      request,
      project.id,
    );

    // Create a key pair credential
    sshPrivateKeyCredential = await boundaryHttp.createStaticCredentialKeyPair(
      request,
      {
        credentialStoreId: credentialStore.id,
        username: sshUser,
        sshKeyPath,
      },
    );

    // Create a json type credential
    jsonCredential = await boundaryHttp.createStaticCredentialJson(request, {
      credentialStoreId: credentialStore.id,
      data: {
        nested: {
          key1: String.raw`val\bue1`,
          key2: String.raw`val\tue2`,
          key3: '',
          key4: null,
          key5: 0,
          key6: false,
          key7: true,
        },
      },
    });

    // Create Vault token and apply policies

    spawnSync('vault', [
      'policy',
      'write',
      boundaryPolicyName,
      boundaryControllerPath,
    ]);
    execSync(`vault secrets enable -path=${secretsPath} kv-v2`);
    spawnSync(
      'vault',
      [
        'kv',
        'put',
        '-mount',
        secretsPath,
        secretName,
        `password=${String.raw`pass\word`}`,
        'private_key=0',
        'username=false',
      ],
      {
        encoding: 'utf-8',
      },
    );
    spawnSync('vault', ['policy', 'write', secretPolicyName, kvPolicyPath]);
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
    vaultGenericCredentialLibrary =
      await boundaryHttp.createVaultGenericSecretsCredentialLibrary(request, {
        credentialStoreId: vaultCredentialStore.id,
        vaultPath: `${secretsPath}/data/${secretName}`,
      });

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
        credentialIds: [vaultGenericCredentialLibrary.id],
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
  execSync(`vault policy delete ${secretPolicyName}`);
  execSync(`vault policy delete ${boundaryPolicyName}`);
  execSync(`vault secrets disable ${secretsPath}`);

  if (org) {
    await boundaryHttp.deleteOrg(request, org.id);
  }
});

test.describe('Credential Panel tests', () => {
  test('Display Vault brokered Credentials and handle special characters', async ({
    authedPage,
  }) => {
    await authedPage
      .getByRole('link', { name: targetWithBrokeredVaultCredentials.name })
      .click();
    await authedPage.getByRole('button', { name: 'Connect' }).click();
    await expect(
      authedPage.getByRole('heading', { name: 'Sessions' }),
    ).toBeVisible();

    await expect(
      authedPage.getByText(vaultGenericCredentialLibrary.name),
    ).toBeVisible();
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
    ).toHaveText('0');
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
    ).toHaveText('false');

    // End session as active sessions will show a popup when trying to close the DC
    await authedPage.getByRole('button', { name: 'End Session' }).click();
    await expect(authedPage.getByText('Canceled successfully.')).toBeVisible();
    await expect(
      authedPage.getByRole('heading', { name: 'Targets' }),
    ).toBeVisible();
  });

  test('Display JSON static credential in a key value format and handle special characters', async ({
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
    ).toHaveText(String.raw`val\bue1`);
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
    ).toHaveText(String.raw`val\tue2`);
    // Empty string and null should not be visible
    await expect(
      authedPage.getByRole('listitem').filter({ hasText: 'nested.key3' }),
    ).toBeHidden();

    await expect(
      authedPage.getByRole('listitem').filter({ hasText: 'nested.key4' }),
    ).toBeHidden();

    await authedPage
      .getByRole('listitem')
      .filter({ hasText: 'nested.key5' })
      .getByLabel('Toggle secret visibility')
      .click();
    await expect(
      authedPage
        .getByRole('listitem')
        .filter({ hasText: 'nested.key5' })
        .locator('pre'),
    ).toHaveText('0');
    await authedPage
      .getByRole('listitem')
      .filter({ hasText: 'nested.key6' })
      .getByLabel('Toggle secret visibility')
      .click();
    await expect(
      authedPage
        .getByRole('listitem')
        .filter({ hasText: 'nested.key6' })
        .locator('pre'),
    ).toHaveText('false');
    await authedPage
      .getByRole('listitem')
      .filter({ hasText: 'nested.key7' })
      .getByLabel('Toggle secret visibility')
      .click();
    await expect(
      authedPage
        .getByRole('listitem')
        .filter({ hasText: 'nested.key7' })
        .locator('pre'),
    ).toHaveText('true');

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

    // End session as active sessions will show a popup when trying to close the DC
    await authedPage.getByRole('button', { name: 'End Session' }).click();
    await expect(authedPage.getByText('Canceled successfully.')).toBeVisible();
    await expect(
      authedPage.getByRole('heading', { name: 'Targets' }),
    ).toBeVisible();
  });
});
