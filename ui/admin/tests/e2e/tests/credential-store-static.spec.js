/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

/* eslint-disable no-undef */
const { test, expect } = require('@playwright/test');
const { readFile } = require('fs/promises');
const { nanoid } = require('nanoid');
const { checkEnv, authenticatedState } = require('../helpers/general');
const {
  authenticateBoundaryCli,
  checkBoundaryCli,
  getSessionCli,
} = require('../helpers/boundary-cli');
const {
  createNewOrg,
  createNewProject,
  createNewHostCatalog,
  createNewHostSet,
  createNewHostInHostSet,
  createNewTarget,
  addBrokeredCredentialsToTarget,
  addHostSourceToTarget,
} = require('../helpers/boundary-ui');

test.use({ storageState: authenticatedState });

test.beforeAll(async () => {
  await checkEnv([
    'E2E_SSH_USER',
    'E2E_SSH_KEY_PATH',
    'E2E_TARGET_ADDRESS',
    'E2E_TARGET_PORT',
  ]);

  await checkBoundaryCli();
});

let orgName;
let projectName;
let targetName;

test.beforeEach(async ({ page }) => {
  await page.goto('/');

  orgName = await createNewOrg(page);
  projectName = await createNewProject(page);
  await createNewHostCatalog(page);
  const hostSetName = await createNewHostSet(page);
  await createNewHostInHostSet(page);
  targetName = await createNewTarget(page);
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
});

test('Static Credential Store (User & Key Pair)', async ({ page }) => {
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

  await addBrokeredCredentialsToTarget(page, targetName, credentialName);

  await authenticateBoundaryCli();
  const session = await getSessionCli(orgName, projectName, targetName);
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

test('Static Credential Store (Username & Password)', async ({ page }) => {
  const credentialName = 'Credential ' + nanoid();
  await page.getByRole('link', { name: 'Credentials', exact: true }).click();
  await page.getByRole('link', { name: 'New', exact: true }).click();
  await page.getByLabel('Name', { exact: true }).fill(credentialName);
  await page.getByLabel('Description').fill('This is an automated test');
  await page
    .getByRole('group', { name: 'Type' })
    .getByLabel('Username & Password')
    .click();
  await page
    .getByLabel('Username', { exact: true })
    .fill(process.env.E2E_SSH_USER);
  const testPassword = 'password';
  await page.getByLabel('Password', { exact: true }).fill(testPassword);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(page.getByRole('link', { name: credentialName })).toBeVisible();

  await addBrokeredCredentialsToTarget(page, targetName, credentialName);

  await authenticateBoundaryCli();
  const session = await getSessionCli(orgName, projectName, targetName);
  const retrievedUser = session.item.credentials[0].credential.username;
  const retrievedPassword = session.item.credentials[0].credential.password;

  if (process.env.E2E_SSH_USER != retrievedUser) {
    throw new Error(
      'Stored User does not match. EXPECTED: ' +
        process.env.E2E_SSH_USER +
        ', ACTUAL: ' +
        retrievedUser
    );
  }
  if (testPassword != retrievedPassword) {
    throw new Error(
      'Stored Password does not match. EXPECTED: ' +
        testPassword +
        ', ACTUAL: ' +
        retrievedPassword
    );
  }
});

test('Static Credential Store (JSON)', async ({ page }) => {
  const credentialName = 'Credential ' + nanoid();
  await page.getByRole('link', { name: 'Credentials', exact: true }).click();
  await page.getByRole('link', { name: 'New', exact: true }).click();
  await page.getByLabel('Name', { exact: true }).fill(credentialName);
  await page.getByLabel('Description').fill('This is an automated test');
  await page.getByRole('group', { name: 'Type' }).getByLabel('JSON').click();
  await page.getByText('{}').click();
  const testName = 'name-json';
  const testPassword = 'password-json';
  const testId = 'id-json';
  await page.keyboard.type(
    `"username": "${testName}",
    "password": "${testPassword}",
    "id": "${testId}"`
  );
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').getByText('Success', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(page.getByRole('link', { name: credentialName })).toBeVisible();

  await addBrokeredCredentialsToTarget(page, targetName, credentialName);

  await authenticateBoundaryCli();
  const session = await getSessionCli(orgName, projectName, targetName);
  const retrievedUser = session.item.credentials[0].credential.username;
  const retrievedPassword = session.item.credentials[0].credential.password;
  const retrievedId = session.item.credentials[0].credential.id;

  if (testName != retrievedUser) {
    throw new Error(
      'Stored User does not match. EXPECTED: ' +
        process.env.E2E_SSH_USER +
        ', ACTUAL: ' +
        retrievedUser
    );
  }
  if (testPassword != retrievedPassword) {
    throw new Error(
      'Stored Password does not match. EXPECTED: ' +
        testPassword +
        ', ACTUAL: ' +
        retrievedPassword
    );
  }
  if (testId != retrievedId) {
    throw new Error(
      'Stored ID does not match. EXPECTED: ' +
        testId +
        ', ACTUAL: ' +
        retrievedId
    );
  }
});
