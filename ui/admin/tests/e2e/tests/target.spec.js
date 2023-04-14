/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

/* eslint-disable no-undef */
const {test, expect} = require('@playwright/test');
const {exec, execSync} = require('child_process');
const {checkEnv, authenticatedState} = require('../helpers/general');
const {
  authenticateBoundaryCli,
  checkBoundaryCli,
  connectToTarget,
  deleteOrg,
} = require('../helpers/boundary-cli');
const {
  createNewOrg,
  createNewProject,
  createNewHostCatalog,
  createNewHostSet,
  createNewHostInHostSet,
  createNewTarget,
  createNewTargetWithAddress,
  waitForSessionToBeVisible,
  addHostSourceToTarget,
} = require('../helpers/boundary-ui');
let org

test.use({storageState: authenticatedState});

test.beforeAll(async () => {
  await checkEnv([
    'E2E_TARGET_IP',
    'E2E_SSH_USER',
    'E2E_SSH_KEY_PATH',
    'E2E_SSH_PORT',
  ]);

  await checkBoundaryCli();
});

test.afterEach(async () => {
  await deleteOrg(org.id);
})

test('Verify session created then cancel the session', async ({ page }) => {
  await page.goto('/');

  const orgName = await createNewOrg(page);
  const projectName = await createNewProject(page);
  await createNewHostCatalog(page);
  const hostSetName = await createNewHostSet(page);
  await createNewHostInHostSet(page);
  const targetName = await createNewTarget(page);
  await addHostSourceToTarget(page, hostSetName);

  await authenticateBoundaryCli();
  const orgs = JSON.parse(execSync('boundary scopes list -format json'));
  org = orgs.items.filter((obj) => obj.name == orgName)[0];
  const projects = JSON.parse(
    execSync('boundary scopes list -format json -scope-id ' + org.id)
  );
  const project = projects.items.filter((obj) => obj.name == projectName)[0];
  const targets = JSON.parse(
    execSync('boundary targets list -format json -scope-id ' + project.id)
  );
  const target = targets.items.filter((obj) => obj.name == targetName)[0];

  let connect = await connectToTarget(target)
  try {
    await waitForSessionToBeVisible(page, targetName)

    await page
      .getByRole('cell', { name: targetName })
      .locator('..')
      .getByRole('button', { name: 'Cancel' })
      .click();
  } finally {
    // End `boundary connect` process
    if (connect) {
      connect.kill('SIGTERM');
    }
  }
});

test('Verify session created to target with address then cancel the session', async ({page}) => {
  await page.goto('/');

  const orgName = await createNewOrg(page);
  const projectName = await createNewProject(page);
  const targetName = await createNewTargetWithAddress(page);

  await authenticateBoundaryCli();
  const orgs = JSON.parse(execSync('boundary scopes list -format json'));
  org = orgs.items.filter((obj) => obj.name == orgName)[0];
  const projects = JSON.parse(
    execSync('boundary scopes list -format json -scope-id ' + org.id)
  );
  const project = projects.items.filter((obj) => obj.name == projectName)[0];
  const targets = JSON.parse(
    execSync('boundary targets list -format json -scope-id ' + project.id)
  );
  const target = targets.items.filter((obj) => obj.name == targetName)[0];

  let connect = await connectToTarget(target)
  try {
    await waitForSessionToBeVisible(page, targetName)
    await page
      .getByRole('cell', { name: targetName })
      .locator('..')
      .getByRole('button', { name: 'Cancel' })
      .click();
  } finally {
    // End `boundary connect` process
    if (connect) {
      connect.kill();
    }
  }
});
