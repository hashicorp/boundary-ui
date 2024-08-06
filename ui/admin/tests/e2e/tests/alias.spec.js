/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

/* eslint-disable no-undef */
const { test, expect } = require('@playwright/test');
import { execSync } from 'child_process';
import { customAlphabet } from 'nanoid';

const { checkEnv, authenticatedState } = require('../helpers/general');
const {
  authenticateBoundaryCli,
  authorizeAlias,
  checkBoundaryCli,
  deleteAliasCli,
  deleteOrgCli,
} = require('../helpers/boundary-cli');
const AliasesPage = require('../pages/aliases');
const OrgsPage = require('../pages/orgs');
const ProjectsPage = require('../pages/projects');
const TargetsPage = require('../pages/targets');

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

test.describe('Aliases', async () => {
  test('Set up alias from target details page @ce @aws @docker', async ({
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
      await targetsPage.createTargetWithAddress(
        process.env.E2E_TARGET_ADDRESS,
        process.env.E2E_TARGET_PORT,
      );

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
        process.env.BOUNDARY_ADDR,
        process.env.E2E_PASSWORD_AUTH_METHOD_ID,
        process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
        process.env.E2E_PASSWORD_ADMIN_PASSWORD,
      );
      await authorizeAlias(alias);

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
        const orgs = JSON.parse(execSync('boundary scopes list -format json'));
        const org = orgs.items.filter((obj) => obj.name == orgName)[0];
        if (org) {
          await deleteOrgCli(org.id);
        }
      }
      if (alias) {
        await deleteAliasCli(alias);
      }
    }
  });

  test('Set up alias from new target page @ce @aws @docker', async ({
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
      await targetsPage.createTargetWithAddressAndAlias(
        process.env.E2E_TARGET_ADDRESS,
        process.env.E2E_TARGET_PORT,
        alias,
      );

      // Connect to target using alias
      await authorizeAlias(alias);
    } finally {
      await authenticateBoundaryCli(
        process.env.BOUNDARY_ADDR,
        process.env.E2E_PASSWORD_AUTH_METHOD_ID,
        process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
        process.env.E2E_PASSWORD_ADMIN_PASSWORD,
      );

      if (orgName) {
        const orgs = JSON.parse(execSync('boundary scopes list -format json'));
        const org = orgs.items.filter((obj) => obj.name == orgName)[0];
        if (org) {
          await deleteOrgCli(org.id);
        }
        if (alias) {
          await deleteAliasCli(alias);
        }
      }
    }
  });

  test('Set up alias from aliases page @ce @aws @docker', async ({ page }) => {
    await page.goto('/');
    const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);
    let org;
    let alias;
    try {
      const orgsPage = new OrgsPage(page);
      const orgName = await orgsPage.createOrg();
      const projectsPage = new ProjectsPage(page);
      const projectName = await projectsPage.createProject();
      const targetsPage = new TargetsPage(page);
      const targetName = await targetsPage.createTargetWithAddress(
        process.env.E2E_TARGET_ADDRESS,
        process.env.E2E_TARGET_PORT,
      );

      // Create new alias from scope page
      await authenticateBoundaryCli(
        process.env.BOUNDARY_ADDR,
        process.env.E2E_PASSWORD_AUTH_METHOD_ID,
        process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
        process.env.E2E_PASSWORD_ADMIN_PASSWORD,
      );

      const orgs = JSON.parse(execSync('boundary scopes list -format json'));
      org = orgs.items.filter((obj) => obj.name == orgName)[0];
      const projects = JSON.parse(
        execSync('boundary scopes list -format json -scope-id ' + org.id),
      );
      const project = projects.items.filter(
        (obj) => obj.name == projectName,
      )[0];
      const targets = JSON.parse(
        execSync('boundary targets list -format json -scope-id ' + project.id),
      );
      const target = targets.items.filter((obj) => obj.name == targetName)[0];

      alias = 'example.alias.' + nanoid();
      const aliasesPage = new AliasesPage(page);
      await aliasesPage.createAliasForTarget(alias, target.id);
      await authorizeAlias(alias);
    } finally {
      await authenticateBoundaryCli(
        process.env.BOUNDARY_ADDR,
        process.env.E2E_PASSWORD_AUTH_METHOD_ID,
        process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
        process.env.E2E_PASSWORD_ADMIN_PASSWORD,
      );

      if (org) {
        await deleteOrgCli(org.id);
      }
      if (alias) {
        await deleteAliasCli(alias);
      }
    }
  });
});
