/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test, expect } from '@playwright/test';
import { customAlphabet } from 'nanoid';

import { checkEnv, authenticatedState } from '../helpers/general';
import {
  authenticateBoundaryCli,
  authorizeSessionByAliasCli,
  checkBoundaryCli,
  deleteAliasCli,
  deleteScopeCli,
  getOrgIdFromNameCli,
  getProjectIdFromNameCli,
  getTargetIdFromNameCli,
} from '../helpers/boundary-cli';
import { AliasesPage } from '../pages/aliases';
import { CredentialStoresPage } from '../pages/credential-stores';
import { OrgsPage } from '../pages/orgs';
import { ProjectsPage } from '../pages/projects';
import { TargetsPage } from '../pages/targets';

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

test.describe('Aliases (Enterprise)', async () => {
  test('Set up alias from target details page @ent @aws @docker', async ({
    page,
  }) => {
    await page.goto('/');
    let orgName;
    let alias;
    const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);
    try {
      const orgsPage = new OrgsPage(page);
      orgName = await orgsPage.createOrg();
      const projectsPage = new ProjectsPage(page);
      await projectsPage.createProject();

      const targetsPage = new TargetsPage(page);
      const targetName = await targetsPage.createSshTargetWithAddressEnt(
        process.env.E2E_TARGET_ADDRESS,
        process.env.E2E_TARGET_PORT,
      );
      const credentialStoresPage = new CredentialStoresPage(page);
      await credentialStoresPage.createStaticCredentialStore();
      const credentialName =
        await credentialStoresPage.createStaticCredentialKeyPair(
          process.env.E2E_SSH_USER,
          process.env.E2E_SSH_KEY_PATH,
        );
      await targetsPage.addInjectedCredentialsToTarget(
        targetName,
        credentialName,
      );

      // Create alias for target
      await page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(targetName)
        .click();
      const aliasName = 'Alias ' + nanoid();
      alias = 'example.alias.' + nanoid();
      await page.getByRole('link', { name: 'Add an alias' }).click();
      await page.getByLabel('Name').fill(aliasName);
      await page.getByLabel('Description').fill('This is an automated test');
      await page.getByLabel('Alias Value').fill(alias);
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(
        page.getByRole('alert').getByText('Success', { exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Dismiss' }).click();

      // Connect to target using alias
      await authenticateBoundaryCli(
        process.env.BOUNDARY_ADDR,
        process.env.E2E_PASSWORD_AUTH_METHOD_ID,
        process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
        process.env.E2E_PASSWORD_ADMIN_PASSWORD,
      );
      await authorizeSessionByAliasCli(alias);

      // Clear destination from alias
      await page.getByRole('link', { name: alias }).click();
      await page.getByRole('button', { name: 'Manage' }).click();
      await page.getByText('Clear', { exact: true }).click();
      await page.getByText('OK', { exact: true }).click();
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
      if (orgName) {
        const orgId = await getOrgIdFromNameCli(orgName);
        if (orgId) {
          await deleteScopeCli(orgId);
        }
      }
      if (alias) {
        await deleteAliasCli(alias);
      }
    }
  });

  test('Set up alias from new target page @ent @aws @docker', async ({
    page,
  }) => {
    await page.goto('/');
    let orgName;
    let alias;
    const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);
    try {
      const orgsPage = new OrgsPage(page);
      orgName = await orgsPage.createOrg();
      await authenticateBoundaryCli(
        process.env.BOUNDARY_ADDR,
        process.env.E2E_PASSWORD_AUTH_METHOD_ID,
        process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
        process.env.E2E_PASSWORD_ADMIN_PASSWORD,
      );
      const projectsPage = new ProjectsPage(page);
      await projectsPage.createProject();
      alias = 'example.alias.' + nanoid();
      const targetsPage = new TargetsPage(page);
      const targetName = await targetsPage.createTargetWithAddressAndAlias(
        process.env.E2E_TARGET_ADDRESS,
        process.env.E2E_TARGET_PORT,
        alias,
      );
      const credentialStoresPage = new CredentialStoresPage(page);
      await credentialStoresPage.createStaticCredentialStore();
      const credentialName =
        await credentialStoresPage.createStaticCredentialKeyPair(
          process.env.E2E_SSH_USER,
          process.env.E2E_SSH_KEY_PATH,
        );
      await targetsPage.addInjectedCredentialsToTarget(
        targetName,
        credentialName,
      );

      // Connect to target using alias
      await authorizeSessionByAliasCli(alias);
    } finally {
      await authenticateBoundaryCli(
        process.env.BOUNDARY_ADDR,
        process.env.E2E_PASSWORD_AUTH_METHOD_ID,
        process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
        process.env.E2E_PASSWORD_ADMIN_PASSWORD,
      );

      if (orgName) {
        const orgId = await getOrgIdFromNameCli(orgName);
        if (orgId) {
          await deleteScopeCli(orgId);
        }
        if (alias) {
          await deleteAliasCli(alias);
        }
      }
    }
  });

  test('Set up alias from aliases page @ent @aws @docker', async ({ page }) => {
    await page.goto('/');
    const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);
    let orgId;
    let alias;
    try {
      const orgsPage = new OrgsPage(page);
      const orgName = await orgsPage.createOrg();
      const projectsPage = new ProjectsPage(page);
      const projectName = await projectsPage.createProject();
      const targetsPage = new TargetsPage(page);
      const targetName = await targetsPage.createSshTargetWithAddressEnt(
        process.env.E2E_TARGET_ADDRESS,
        process.env.E2E_TARGET_PORT,
      );
      const credentialStoresPage = new CredentialStoresPage(page);
      await credentialStoresPage.createStaticCredentialStore();
      const credentialName =
        await credentialStoresPage.createStaticCredentialKeyPair(
          process.env.E2E_SSH_USER,
          process.env.E2E_SSH_KEY_PATH,
        );
      await targetsPage.addInjectedCredentialsToTarget(
        targetName,
        credentialName,
      );

      // Create new alias from scope page
      await authenticateBoundaryCli(
        process.env.BOUNDARY_ADDR,
        process.env.E2E_PASSWORD_AUTH_METHOD_ID,
        process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
        process.env.E2E_PASSWORD_ADMIN_PASSWORD,
      );
      orgId = await getOrgIdFromNameCli(orgName);
      const projectId = await getProjectIdFromNameCli(orgId, projectName);
      const targetId = await getTargetIdFromNameCli(projectId, targetName);

      alias = 'example.alias.' + nanoid();
      const aliasesPage = new AliasesPage(page);
      await aliasesPage.createAliasForTarget(alias, targetId);
      await authorizeSessionByAliasCli(alias);
    } finally {
      await authenticateBoundaryCli(
        process.env.BOUNDARY_ADDR,
        process.env.E2E_PASSWORD_AUTH_METHOD_ID,
        process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
        process.env.E2E_PASSWORD_ADMIN_PASSWORD,
      );

      if (orgId) {
        await deleteScopeCli(orgId);
      }
      if (alias) {
        await deleteAliasCli(alias);
      }
    }
  });
});
