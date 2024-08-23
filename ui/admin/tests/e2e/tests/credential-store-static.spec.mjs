/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test, expect } from '@playwright/test';
import { readFile } from 'fs/promises';
import { nanoid } from 'nanoid';

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
import { CredentialStoresPage } from '../pages/credential-stores.mjs';
import { OrgsPage } from '../pages/orgs.mjs';
import { ProjectsPage } from '../pages/projects.mjs';
import { TargetsPage } from '../pages/targets.mjs';

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

  const orgsPage = new OrgsPage(page);
  orgName = await orgsPage.createOrg();
  const projectsPage = new ProjectsPage(page);
  projectName = await projectsPage.createProject();
  const targetsPage = new TargetsPage(page);
  targetName = await targetsPage.createTargetWithAddress(
    process.env.E2E_TARGET_ADDRESS,
    process.env.E2E_TARGET_PORT,
  );
  const credentialStoresPage = new CredentialStoresPage(page);
  await credentialStoresPage.createStaticCredentialStore();
});

test('Static Credential Store (User & Key Pair) @ce @aws @docker', async ({
  page,
}) => {
  try {
    const credentialStoresPage = new CredentialStoresPage(page);
    const credentialName =
      await credentialStoresPage.createStaticCredentialKeyPair(
        process.env.E2E_SSH_USER,
        process.env.E2E_SSH_KEY_PATH,
      );
    const targetsPage = new TargetsPage(page);
    await targetsPage.addBrokeredCredentialsToTarget(
      targetName,
      credentialName,
    );

    await authenticateBoundaryCli(
      process.env.BOUNDARY_ADDR,
      process.env.E2E_PASSWORD_AUTH_METHOD_ID,
      process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
      process.env.E2E_PASSWORD_ADMIN_PASSWORD,
    );
    const orgId = await getOrgIdFromNameCli(orgName);
    const projectId = await getProjectIdFromNameCli(orgId, projectName);
    const targetId = await getTargetIdFromNameCli(projectId, targetName);
    const session = await authorizeSessionByTargetIdCli(targetId);
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
    if (orgName) {
      await authenticateBoundaryCli(
        process.env.BOUNDARY_ADDR,
        process.env.E2E_PASSWORD_AUTH_METHOD_ID,
        process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
        process.env.E2E_PASSWORD_ADMIN_PASSWORD,
      );
      const orgId = await getOrgIdFromNameCli(orgName);
      if (orgId) {
        await deleteScopeCli(orgId);
      }
    }
  }
});

test('Static Credential Store (Username & Password) @ce @aws @docker', async ({
  page,
}) => {
  try {
    const testPassword = 'password';
    const credentialStoresPage = new CredentialStoresPage(page);
    const credentialName =
      await credentialStoresPage.createStaticCredentialUsernamePassword(
        process.env.E2E_SSH_USER,
        testPassword,
      );
    const targetsPage = new TargetsPage(page);
    await targetsPage.addBrokeredCredentialsToTarget(
      targetName,
      credentialName,
    );

    await authenticateBoundaryCli(
      process.env.BOUNDARY_ADDR,
      process.env.E2E_PASSWORD_AUTH_METHOD_ID,
      process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
      process.env.E2E_PASSWORD_ADMIN_PASSWORD,
    );
    const orgId = await getOrgIdFromNameCli(orgName);
    const projectId = await getProjectIdFromNameCli(orgId, projectName);
    const targetId = await getTargetIdFromNameCli(projectId, targetName);
    const session = await authorizeSessionByTargetIdCli(targetId);
    const retrievedUser = session.item.credentials[0].credential.username;
    const retrievedPassword = session.item.credentials[0].credential.password;

    expect(retrievedUser).toBe(process.env.E2E_SSH_USER);
    expect(retrievedPassword).toBe(testPassword);
  } finally {
    if (orgName) {
      await authenticateBoundaryCli(
        process.env.BOUNDARY_ADDR,
        process.env.E2E_PASSWORD_AUTH_METHOD_ID,
        process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
        process.env.E2E_PASSWORD_ADMIN_PASSWORD,
      );
      const orgId = await getOrgIdFromNameCli(orgName);
      if (orgId) {
        await deleteScopeCli(orgId);
      }
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

    const targetsPage = new TargetsPage(page);
    await targetsPage.addBrokeredCredentialsToTarget(
      targetName,
      credentialName,
    );

    await authenticateBoundaryCli(
      process.env.BOUNDARY_ADDR,
      process.env.E2E_PASSWORD_AUTH_METHOD_ID,
      process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
      process.env.E2E_PASSWORD_ADMIN_PASSWORD,
    );
    const orgId = await getOrgIdFromNameCli(orgName);
    const projectId = await getProjectIdFromNameCli(orgId, projectName);
    const targetId = await getTargetIdFromNameCli(projectId, targetName);
    const session = await authorizeSessionByTargetIdCli(targetId);
    const retrievedUser = session.item.credentials[0].credential.username;
    const retrievedPassword = session.item.credentials[0].credential.password;
    const retrievedId = session.item.credentials[0].credential.id;

    expect(retrievedUser).toBe(testName);
    expect(retrievedPassword).toBe(testPassword);
    expect(retrievedId).toBe(testId);
  } finally {
    if (orgName) {
      await authenticateBoundaryCli(
        process.env.BOUNDARY_ADDR,
        process.env.E2E_PASSWORD_AUTH_METHOD_ID,
        process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
        process.env.E2E_PASSWORD_ADMIN_PASSWORD,
      );
      const orgId = await getOrgIdFromNameCli(orgName);
      if (orgId) {
        await deleteScopeCli(orgId);
      }
    }
  }
});

test('Multiple Credential Stores (CE) @ce @aws @docker', async ({ page }) => {
  try {
    const credentialStoresPage = new CredentialStoresPage(page);
    const credentialName =
      await credentialStoresPage.createStaticCredentialKeyPair(
        process.env.E2E_SSH_USER,
        process.env.E2E_SSH_KEY_PATH,
      );
    const credentialName2 =
      await credentialStoresPage.createStaticCredentialUsernamePassword(
        process.env.E2E_SSH_USER,
        'testPassword',
      );

    const targetsPage = new TargetsPage(page);
    await targetsPage.addBrokeredCredentialsToTarget(
      targetName,
      credentialName,
    );
    await targetsPage.addBrokeredCredentialsToTarget(
      targetName,
      credentialName2,
    );

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
    if (orgName) {
      await authenticateBoundaryCli(
        process.env.BOUNDARY_ADDR,
        process.env.E2E_PASSWORD_AUTH_METHOD_ID,
        process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
        process.env.E2E_PASSWORD_ADMIN_PASSWORD,
      );
      const orgId = await getOrgIdFromNameCli(orgName);
      if (orgId) {
        await deleteScopeCli(orgId);
      }
    }
  }
});
