/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

/* eslint-disable no-undef */
const { test, expect } = require('@playwright/test');
const { execSync } = require('child_process');
const { checkEnv, authenticatedState } = require('../helpers/general');
const {
  authenticateBoundaryCli,
  checkBoundaryCli,
  connectToTarget,
  deleteOrgCli,
} = require('../helpers/boundary-cli');
const {
  createOrg,
  createProject,
  createHostCatalog,
  createHostSet,
  createHostInHostSet,
  createTarget,
  createTargetWithAddress,
  waitForSessionToBeVisible,
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

test('Verify session created to target with host, then cancel the session @ce @aws @docker', async ({
  page,
}) => {
  await page.goto('/');
  let org;
  let connect;
  try {
    const orgName = await createOrg(page);
    const projectName = await createProject(page);

    // Create host set
    const hostCatalogName = await createHostCatalog(page);
    const hostSetName = await createHostSet(page);
    await createHostInHostSet(page, process.env.E2E_TARGET_ADDRESS);

    // Create another host set
    await page
      .getByRole('navigation', { name: 'Resources' })
      .getByRole('link', { name: 'Host Catalogs' })
      .click();
    await page.getByRole('link', { name: hostCatalogName }).click();
    const hostSetName2 = await createHostSet(page);

    // Create target
    const targetName = await createTarget(page, process.env.E2E_TARGET_PORT);
    await addHostSourceToTarget(page, hostSetName);

    // Add/Remove another host source
    await addHostSourceToTarget(page, hostSetName2);
    await page
      .getByRole('link', { name: hostSetName2 })
      .locator('..')
      .locator('..')
      .getByRole('button', { name: 'Manage' })
      .click();
    await page.getByRole('button', { name: 'Remove' }).click();
    await page.getByRole('button', { name: 'OK' }).click();
    await expect(
      page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss' }).click();

    // Connect to target
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
    const project = projects.items.filter((obj) => obj.name == projectName)[0];
    const targets = JSON.parse(
      execSync('boundary targets list -format json -scope-id ' + project.id),
    );
    const target = targets.items.filter((obj) => obj.name == targetName)[0];

    connect = await connectToTarget(
      target.id,
      process.env.E2E_SSH_USER,
      process.env.E2E_SSH_KEY_PATH,
    );
    await waitForSessionToBeVisible(page, targetName);
    await page
      .getByRole('cell', { name: targetName })
      .locator('..')
      .getByRole('button', { name: 'Cancel' })
      .click();
  } finally {
    if (org) {
      await deleteOrgCli(org.id);
    }
    // End `boundary connect` process
    if (connect) {
      connect.kill('SIGTERM');
    }
  }
});

test('Verify session created to target with address, then cancel the session @ce @aws @docker', async ({
  page,
}) => {
  await page.goto('/');
  let org;
  let connect;
  try {
    const orgName = await createOrg(page);
    const projectName = await createProject(page);
    const targetName = await createTargetWithAddress(
      page,
      process.env.E2E_TARGET_ADDRESS,
      process.env.E2E_TARGET_PORT,
    );

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
    const project = projects.items.filter((obj) => obj.name == projectName)[0];
    const targets = JSON.parse(
      execSync('boundary targets list -format json -scope-id ' + project.id),
    );
    const target = targets.items.filter((obj) => obj.name == targetName)[0];

    connect = await connectToTarget(
      target.id,
      process.env.E2E_SSH_USER,
      process.env.E2E_SSH_KEY_PATH,
    );
    await waitForSessionToBeVisible(page, targetName);
    await page
      .getByRole('cell', { name: targetName })
      .locator('..')
      .getByRole('button', { name: 'Cancel' })
      .click();
  } finally {
    if (org) {
      await deleteOrgCli(org.id);
    }
    // End `boundary connect` process
    if (connect) {
      connect.kill('SIGTERM');
    }
  }
});

test('Verify TCP target is updated @ce @aws @docker', async ({ page }) => {
  await page.goto('/');
  let orgName;
  try {
    orgName = await createOrg(page);
    await createProject(page);
    await createTargetWithAddress(
      page,
      process.env.E2E_TARGET_ADDRESS,
      process.env.E2E_TARGET_PORT,
    );

    // Update target
    await page.getByRole('button', { name: 'Edit Form' }).click();
    await page.getByLabel('Name').fill('New target name');
    await page.getByLabel('Description').fill('New description');
    await page.getByLabel('Target Address').fill('127.0.0.1');
    await page.getByLabel('Default Port').fill('10');
    await page.getByLabel('Default Client Port').fill('10');
    await page.getByLabel('Maximum Duration').fill('1000');
    await page.getByLabel('Maximum Connections').fill('10');
    await page.getByLabel('Egress worker filter').click();
    await page
      .getByRole('textbox', { name: /^Filter/, exact: true })
      .fill('"dev" in "/tags/type"');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(
      page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
  } finally {
    await authenticateBoundaryCli(
      process.env.BOUNDARY_ADDR,
      process.env.E2E_PASSWORD_AUTH_METHOD_ID,
      process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
      process.env.E2E_PASSWORD_ADMIN_PASSWORD,
    );
    const orgs = JSON.parse(execSync('boundary scopes list -format json'));
    const org = orgs.items.filter((obj) => obj.name === orgName)[0];
    if (org) {
      await deleteOrgCli(org.id);
    }
  }
});
