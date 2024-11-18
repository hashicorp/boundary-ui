/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../playwright.config.js';
import { expect } from '@playwright/test';
import { customAlphabet } from 'nanoid';

import { authenticatedState } from '../global-setup.js';
import {
  authenticateBoundaryCli,
  authorizeSessionByAliasCli,
  checkBoundaryCli,
  deleteAliasCli,
  deleteScopeCli,
  getOrgIdFromNameCli,
  getProjectIdFromNameCli,
  getTargetIdFromNameCli,
} from '../../helpers/boundary-cli.js';
import { AliasesPage } from '../pages/aliases.js';
import { CredentialStoresPage } from '../pages/credential-stores.js';
import { OrgsPage } from '../pages/orgs.js';
import { ProjectsPage } from '../pages/projects.js';
import { TargetsPage } from '../pages/targets.js';

test.use({ storageState: authenticatedState });

test.beforeAll(async () => {
  await checkBoundaryCli();
});

test.describe('Aliases (Enterprise)', async () => {
  test('Set up alias from target details page @ent @aws @docker', async ({
    page,
    baseURL,
    adminAuthMethodId,
    adminLoginName,
    adminPassword,
    sshUser,
    sshKeyPath,
    targetAddress,
    targetPort,
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
        targetAddress,
        targetPort,
      );
      const credentialStoresPage = new CredentialStoresPage(page);
      await credentialStoresPage.createStaticCredentialStore();
      const credentialName =
        await credentialStoresPage.createStaticCredentialKeyPair(
          sshUser,
          sshKeyPath,
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
        baseURL,
        adminAuthMethodId,
        adminLoginName,
        adminPassword,
      );
      await authorizeSessionByAliasCli(alias);

      // Clear destination from alias
      await page.getByRole('link', { name: alias }).click();
      // Note: On the Target details page, there is a section with the header
      // "Aliases". The extra check here is to ensure that we are on the Alias
      // details page and not the Target details page.
      await expect(page.getByRole('heading', { name: 'Alias' })).not.toHaveText(
        'Aliases',
      );
      await page.getByRole('button', { name: 'Manage' }).click();
      await page.getByText('Clear', { exact: true }).click();
      await page.getByText('OK', { exact: true }).click();
      await expect(
        page.getByRole('alert').getByText('Success', { exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Dismiss' }).click();
    } finally {
      await authenticateBoundaryCli(
        baseURL,
        adminAuthMethodId,
        adminLoginName,
        adminPassword,
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
    baseURL,
    adminAuthMethodId,
    adminLoginName,
    adminPassword,
    sshUser,
    sshKeyPath,
    targetAddress,
    targetPort,
  }) => {
    await page.goto('/');
    let orgName;
    let alias;
    const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);
    try {
      const orgsPage = new OrgsPage(page);
      orgName = await orgsPage.createOrg();
      await authenticateBoundaryCli(
        baseURL,
        adminAuthMethodId,
        adminLoginName,
        adminPassword,
      );
      const projectsPage = new ProjectsPage(page);
      await projectsPage.createProject();
      alias = 'example.alias.' + nanoid();
      const targetsPage = new TargetsPage(page);
      const targetName = await targetsPage.createTargetWithAddressAndAlias(
        targetAddress,
        targetPort,
        alias,
      );
      const credentialStoresPage = new CredentialStoresPage(page);
      await credentialStoresPage.createStaticCredentialStore();
      const credentialName =
        await credentialStoresPage.createStaticCredentialKeyPair(
          sshUser,
          sshKeyPath,
        );
      await targetsPage.addInjectedCredentialsToTarget(
        targetName,
        credentialName,
      );

      // Connect to target using alias
      await authorizeSessionByAliasCli(alias);
    } finally {
      await authenticateBoundaryCli(
        baseURL,
        adminAuthMethodId,
        adminLoginName,
        adminPassword,
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

  test('Set up alias from aliases page @ent @aws @docker', async ({
    page,
    baseURL,
    adminAuthMethodId,
    adminLoginName,
    adminPassword,
    sshUser,
    sshKeyPath,
    targetAddress,
    targetPort,
  }) => {
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
        targetAddress,
        targetPort,
      );
      const credentialStoresPage = new CredentialStoresPage(page);
      await credentialStoresPage.createStaticCredentialStore();
      const credentialName =
        await credentialStoresPage.createStaticCredentialKeyPair(
          sshUser,
          sshKeyPath,
        );
      await targetsPage.addInjectedCredentialsToTarget(
        targetName,
        credentialName,
      );

      // Create new alias from scope page
      await authenticateBoundaryCli(
        baseURL,
        adminAuthMethodId,
        adminLoginName,
        adminPassword,
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
        baseURL,
        adminAuthMethodId,
        adminLoginName,
        adminPassword,
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
