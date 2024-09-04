/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../playwright.config.mjs'
import { expect } from '@playwright/test';
import { customAlphabet } from 'nanoid';

import { authenticatedState } from '../global-setup.mjs';
import {
  authenticateBoundaryCli,
  authorizeSessionByAliasCli,
  checkBoundaryCli,
  deleteAliasCli,
  deleteScopeCli,
  getOrgIdFromNameCli,
  getProjectIdFromNameCli,
  getTargetIdFromNameCli,
} from '../helpers/boundary-cli.mjs';
import { AliasesPage } from '../pages/aliases.mjs';
import { OrgsPage } from '../pages/orgs.mjs';
import { ProjectsPage } from '../pages/projects.mjs';
import { TargetsPage } from '../pages/targets.mjs';

test.use({ storageState: authenticatedState });

test.beforeAll(async () => {
  await checkBoundaryCli();
});

test.describe('Aliases', async () => {
  test('Set up alias from target details page @ce @aws @docker', async ({
    page,
    baseURL,
    adminAuthMethodId,
    adminLoginName,
    adminPassword,
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
      await targetsPage.createTargetWithAddress(targetAddress, targetPort);

      // Create alias for target
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

  test('Set up alias from new target page @ce @aws @docker', async ({
    page,
    baseURL,
    adminAuthMethodId,
    adminLoginName,
    adminPassword,
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
      await targetsPage.createTargetWithAddressAndAlias(targetAddress, targetPort, alias);

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

  test('Set up alias from aliases page @ce @aws @docker', async ({
    page,
    baseURL,
    adminAuthMethodId,
    adminLoginName,
    adminPassword,
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
      const targetName = await targetsPage.createTargetWithAddress(targetAddress, targetPort);

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
