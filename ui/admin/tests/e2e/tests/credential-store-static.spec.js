/* eslint-disable no-undef */
const { test, expect } = require('@playwright/test');
const { execSync } = require('child_process');
const { readFile } = require('fs/promises');
const { nanoid } = require('nanoid');
const { checkEnv, authenticatedState } = require('../helpers/general');
const {
  authenticateBoundaryCli,
  checkBoundaryCli,
} = require('../helpers/boundary-cli');
const {
  createNewOrg,
  createNewProject,
  createNewHostCatalog,
  createNewHostSet,
  createNewHostInHostSet,
  createNewTarget,
  addHostSourceToTarget,
} = require('../helpers/boundary-ui');

test.use({ storageState: authenticatedState });

test.beforeAll(async () => {
  await checkEnv([
    'E2E_TARGET_IP',
    'E2E_SSH_USER',
    'E2E_SSH_KEY_PATH',
    'E2E_SSH_PORT',
  ]);

  await checkBoundaryCli();
});

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Static Credential Store (User & Key Pair)', async ({ page }) => {
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
  await page.getByRole('group', { name: 'Type' }).getByLabel('Static').click();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(
    page.getByRole('link', { name: credentialStoreName })
  ).toBeVisible();

  const credentialName = 'Credential ' + nanoid();
  await page.getByRole('link', { name: 'Credentials', exact: true }).click();
  await page.getByRole('link', { name: 'New', exact: true }).click();
  await page.getByLabel('Name', { exact: true }).fill(credentialName);
  await page.getByLabel('Description').fill('This is an automated test');
  await page
    .getByRole('group', { name: 'Type' })
    .getByLabel('Username & Key Pair')
    .click();
  await page
    .getByLabel('Username', { exact: true })
    .fill(process.env.E2E_SSH_USER);
  const keyData = await readFile(process.env.E2E_SSH_KEY_PATH, {
    encoding: 'utf-8',
  });
  await page.getByLabel('SSH Private Key', { exact: true }).fill(keyData);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(page.getByRole('link', { name: credentialName })).toBeVisible();

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
    .click();
  await page
    .getByRole('cell', { name: credentialName })
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
  await expect(page.getByRole('link', { name: credentialName })).toBeVisible();

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

  const session = JSON.parse(
    execSync(`boundary targets authorize-session -id ${target.id} -format json`)
  );
  const retrievedUser = session.item.credentials[0].credential.username;
  const retrievedKey = session.item.credentials[0].credential.private_key;

  if (process.env.E2E_SSH_USER != retrievedUser) {
    throw new Error(
      'Stored User does not match. EXPECTED: ' +
      process.env.E2E_SSH_USER +
      ', ACTUAL: ' +
      retrievedUser
    );
  }
  if (keyData != retrievedKey) {
    throw new Error('Stored Key does not match');
  }
});
