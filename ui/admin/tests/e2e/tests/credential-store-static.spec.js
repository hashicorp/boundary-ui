/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

/* eslint-disable no-undef */
const { test, expect } = require('@playwright/test');
const { execSync } = require('child_process');
const { readFile } = require('fs/promises');
const { nanoid } = require('nanoid');
const { checkEnv, authenticatedState } = require('../helpers/general');
const {
  authenticateBoundaryCli,
  checkBoundaryCli,
  deleteOrgCli,
  getSessionCli,
} = require('../helpers/boundary-cli');
const {
  addBrokeredCredentialsToTarget,
  createOrg,
  createProject,
  createTargetWithAddress,
  createStaticCredentialStore,
  createStaticCredentialKeyPair,
  createStaticCredentialUsernamePassword,
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

  orgName = await createOrg(page);
  projectName = await createProject(page);
  targetName = await createTargetWithAddress(
    page,
    process.env.E2E_TARGET_ADDRESS,
    process.env.E2E_TARGET_PORT,
  );
  await createStaticCredentialStore(page);
});

test('Static Credential Store (User & Key Pair) @ce @aws @docker', async ({
  page,
}) => {
  try {
    const credentialName = await createStaticCredentialKeyPair(
      page,
      process.env.E2E_SSH_USER,
      process.env.E2E_SSH_KEY_PATH,
    );
    await addBrokeredCredentialsToTarget(page, targetName, credentialName);

    await authenticateBoundaryCli(
      process.env.BOUNDARY_ADDR,
      process.env.E2E_PASSWORD_AUTH_METHOD_ID,
      process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
      process.env.E2E_PASSWORD_ADMIN_PASSWORD,
    );
    const session = await getSessionCli(orgName, projectName, targetName);
    const retrievedUser = session.item.credentials[0].credential.username;
    const retrievedKey = session.item.credentials[0].credential.private_key;

    expect(retrievedUser).toBe(process.env.E2E_SSH_USER);

    const keyData = await readFile(process.env.E2E_SSH_KEY_PATH, {
      encoding: 'utf-8',
    });
    if (keyData != retrievedKey) {
      throw new Error('Stored Key does not match');
    }
  } finally {
    await authenticateBoundaryCli(
      process.env.BOUNDARY_ADDR,
      process.env.E2E_PASSWORD_AUTH_METHOD_ID,
      process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
      process.env.E2E_PASSWORD_ADMIN_PASSWORD,
    );
    const orgs = JSON.parse(execSync('boundary scopes list -format json'));
    const org = orgs.items.filter((obj) => obj.name == orgName)[0];
    if (org) {
      await deleteOrgCli(org.id);
    }
  }
});

test('Static Credential Store (Username & Password) @ce @aws @docker', async ({
  page,
}) => {
  try {
    const testPassword = 'password';
    const credentialName = await createStaticCredentialUsernamePassword(
      page,
      process.env.E2E_SSH_USER,
      testPassword,
    );
    await addBrokeredCredentialsToTarget(page, targetName, credentialName);

    await authenticateBoundaryCli(
      process.env.BOUNDARY_ADDR,
      process.env.E2E_PASSWORD_AUTH_METHOD_ID,
      process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
      process.env.E2E_PASSWORD_ADMIN_PASSWORD,
    );
    const session = await getSessionCli(orgName, projectName, targetName);
    const retrievedUser = session.item.credentials[0].credential.username;
    const retrievedPassword = session.item.credentials[0].credential.password;

    expect(retrievedUser).toBe(process.env.E2E_SSH_USER);
    expect(retrievedPassword).toBe(testPassword);
  } finally {
    await authenticateBoundaryCli(
      process.env.BOUNDARY_ADDR,
      process.env.E2E_PASSWORD_AUTH_METHOD_ID,
      process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
      process.env.E2E_PASSWORD_ADMIN_PASSWORD,
    );
    const orgs = JSON.parse(execSync('boundary scopes list -format json'));
    const org = orgs.items.filter((obj) => obj.name == orgName)[0];
    if (org) {
      await deleteOrgCli(org.id);
    }
  }
});

test('Static Credential Store (JSON) @ce @aws @docker', async ({ page }) => {
  try {
    const credentialName = 'Credential ' + nanoid();
    await page.getByRole('link', { name: 'Credentials', exact: true }).click();
    await page.getByRole('link', { name: 'New', exact: true }).click();
    await page.getByLabel('Name (Optional)').fill(credentialName);
    await page.getByLabel('Description').fill('This is an automated test');
    await page.getByRole('group', { name: 'Type' }).getByLabel('JSON').click();
    await page.getByText('{}').click();
    const testName = 'name-json';
    const testPassword = 'password-json';
    const testId = 'id-json';
    await page.keyboard.type(
      `"username": "${testName}",
    "password": "${testPassword}",
    "id": "${testId}"`,
    );
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(
      page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss' }).click();
    await expect(
      page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(credentialName),
    ).toBeVisible();

    await addBrokeredCredentialsToTarget(page, targetName, credentialName);

    await authenticateBoundaryCli(
      process.env.BOUNDARY_ADDR,
      process.env.E2E_PASSWORD_AUTH_METHOD_ID,
      process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
      process.env.E2E_PASSWORD_ADMIN_PASSWORD,
    );
    const session = await getSessionCli(orgName, projectName, targetName);
    const retrievedUser = session.item.credentials[0].credential.username;
    const retrievedPassword = session.item.credentials[0].credential.password;
    const retrievedId = session.item.credentials[0].credential.id;

    expect(retrievedUser).toBe(testName);
    expect(retrievedPassword).toBe(testPassword);
    expect(retrievedId).toBe(testId);
  } finally {
    await authenticateBoundaryCli(
      process.env.BOUNDARY_ADDR,
      process.env.E2E_PASSWORD_AUTH_METHOD_ID,
      process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
      process.env.E2E_PASSWORD_ADMIN_PASSWORD,
    );
    const orgs = JSON.parse(execSync('boundary scopes list -format json'));
    const org = orgs.items.filter((obj) => obj.name == orgName)[0];
    if (org) {
      await deleteOrgCli(org.id);
    }
  }
});

test('Multiple Credential Stores (CE) @ce @aws @docker', async ({ page }) => {
  try {
    const credentialName = await createStaticCredentialKeyPair(
      page,
      process.env.E2E_SSH_USER,
      process.env.E2E_SSH_KEY_PATH,
    );
    const credentialName2 = await createStaticCredentialUsernamePassword(
      page,
      process.env.E2E_SSH_USER,
      'testPassword',
    );

    await addBrokeredCredentialsToTarget(page, targetName, credentialName);
    await addBrokeredCredentialsToTarget(page, targetName, credentialName2);

    // Remove the host source from the target
    await page
      .getByRole('link', { name: credentialName2 })
      .locator('..')
      .locator('..')
      .getByRole('button', { name: 'Manage' })
      .click();
    await page.getByRole('button', { name: 'Remove' }).click();
    await page.getByRole('button', { name: 'OK', exact: true }).click();
    await expect(
      page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss' }).click();
  } finally {
    await authenticateBoundaryCli(
      process.env.BOUNDARY_ADDR,
      process.env.E2E_PASSWORD_AUTH_METHOD_ID,
      process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
      process.env.E2E_PASSWORD_ADMIN_PASSWORD,
    );
    const orgs = JSON.parse(execSync('boundary scopes list -format json'));
    const org = orgs.items.filter((obj) => obj.name == orgName)[0];
    if (org) {
      await deleteOrgCli(org.id);
    }
  }
});
