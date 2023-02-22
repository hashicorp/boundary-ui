/* eslint-disable no-undef */
const { test, expect } = require('@playwright/test');
const { execSync } = require('child_process');
const { nanoid } = require('nanoid');
const { checkEnv } = require('../helpers/general');
const {
  authenticateBoundaryCli,
  checkBoundaryCli,
} = require('../helpers/boundary-cli');
const { checkVaultCli } = require('../helpers/vault-cli');
const {
  createNewOrg,
  createNewProject,
  createNewHostCatalog,
  createNewHostSet,
  createNewHostInHostSet,
  createNewTarget,
  addHostSourceToTarget,
} = require('../helpers/boundary-ui');

const secretsPath = 'e2e_secrets';
const secretName = 'cred';
const secretPolicyName = 'kv-policy';
const boundaryPolicyName = 'boundary-controller';

test.use({ storageState: './tests/e2e/artifacts/authenticated-state.json' });

test.beforeAll(async () => {
  await checkEnv([
    'VAULT_ADDR', // Address used by Vault CLI
    'VAULT_TOKEN',
    'E2E_VAULT_ADDR', // Address used by Boundary Server (could be different from VAULT_ADDR depending on network config (i.e. docker network))
    'E2E_TARGET_IP',
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

test('Vault Credential Store (User & Key Pair)', async ({ page }) => {
  execSync(
    `vault policy write ${boundaryPolicyName} ./tests/e2e/tests/fixtures/boundary-controller-policy.hcl`
  );
  execSync(`vault secrets enable -path=${secretsPath} kv-v2`);
  execSync(
    `vault kv put -mount ${secretsPath} ${secretName} ` +
      ` username=${process.env.E2E_SSH_USER}` +
      ` private_key=@${process.env.E2E_SSH_KEY_PATH}`
  );
  execSync(
    `vault policy write ${secretPolicyName} ./tests/e2e/tests/fixtures/kv-policy.hcl`
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
        ` -format=json`
    )
  );
  const clientToken = vaultToken.auth.client_token;

  const orgName = await createNewOrg(page);
  const projectName = await createNewProject(page);
  await createNewHostCatalog(page);
  const hostSetName = await createNewHostSet(page);
  await createNewHostInHostSet(page);
  const targetName = await createNewTarget(page);
  await addHostSourceToTarget(page, hostSetName);

  const credentialStoreName = 'Credential Store ' + nanoid();
  await page
    .getByRole('navigation', { name: 'Resources' })
    .getByRole('link', { name: 'Credential Stores' })
    .click();
  await page.getByRole('link', { name: 'New' }).click();
  await page.getByLabel('Name', { exact: true }).fill(credentialStoreName);
  await page.getByLabel('Description').fill('This is an automated test');
  await page.getByRole('group', { name: 'Type' }).getByLabel('Vault').click();
  await page
    .getByLabel('Address', { exact: true })
    .fill(process.env.E2E_VAULT_ADDR);
  await page.getByLabel('Token', { exact: true }).fill(clientToken);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page.getByRole('link', { name: credentialStoreName })
  ).toBeVisible();

  const credentialLibraryName = 'Credential Library ' + nanoid();
  await page.getByRole('link', { name: 'Credential Libraries' }).click();
  await page.getByRole('link', { name: 'New', exact: true }).click();
  await page
    .getByLabel('Name (Optional)', { exact: true })
    .fill(credentialLibraryName);
  await page
    .getByLabel('Description (Optional)')
    .fill('This is an automated test');
  await page.getByLabel('Vault Path').fill(`${secretsPath}/data/${secretName}`);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();

  await page
    .getByRole('navigation', { name: 'Resources' })
    .getByRole('link', { name: 'Targets' })
    .click();
  await page.getByRole('link', { name: targetName }).click();
  await page
    .getByRole('link', { name: 'Brokered Credentials', exact: true })
    .click();
  await page
    .getByRole('article')
    .getByRole('link', { name: 'Add Brokered Credentials', exact: true })
    .click(); // have to go through manage? !!
  await page
    .getByRole('cell', { name: credentialLibraryName })
    .locator('..')
    .getByRole('checkbox')
    .click({ force: true });
  await page
    .getByRole('button', { name: 'Add Brokered Credentials', exact: true })
    .click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page.getByRole('link', { name: credentialLibraryName })
  ).toBeVisible();

  await authenticateBoundaryCli();
  const orgs = JSON.parse(execSync('boundary scopes list -format json'));
  const org = orgs.items.filter((obj) => obj.name == orgName)[0];
  const projects = JSON.parse(
    execSync(`boundary scopes list -format json -scope-id ${org.id}`)
  );
  const project = projects.items.filter((obj) => obj.name == projectName)[0];
  const targets = JSON.parse(
    execSync(`boundary targets list -format json -scope-id ${project.id}`)
  );
  const target = targets.items.filter((obj) => obj.name == targetName)[0];

  JSON.parse(
    execSync(`boundary targets authorize-session -id ${target.id} -format json`)
  );
  // const session = JSON.parse(execSync(`boundary targets authorize-session -id ${target.id} -format json`))
  // console.log(org.id);
  // console.log(session.item.credentials[0].secret.decoded.data.username);
  // console.log(session.item.credentials[0].secret.decoded.data.private_key);
});
