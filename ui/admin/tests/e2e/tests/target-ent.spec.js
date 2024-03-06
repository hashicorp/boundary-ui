/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

/* eslint-disable no-undef */
const { test } = require('@playwright/test');
const { execSync } = require('child_process');
const { checkEnv, authenticatedState } = require('../helpers/general');
const {
  authenticateBoundaryCli,
  checkBoundaryCli,
  connectToTarget,
  connectSshToTarget,
  deleteOrgCli,
} = require('../helpers/boundary-cli');
const {
  createNewOrg,
  createNewProject,
  createStaticCredentialStore,
  createStaticCredentialKeyPair,
  addInjectedCredentialsToTarget,
  createTcpTargetWithAddressEnt,
  createSshTargetWithAddressEnt,
  waitForSessionToBeVisible,
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

test('Verify session created for TCP target @ent @aws @docker', async ({
  page,
}) => {
  await page.goto('/');
  let org;
  let connect;
  try {
    const orgName = await createNewOrg(page);
    await authenticateBoundaryCli();
    const orgs = JSON.parse(execSync('boundary scopes list -format json'));
    org = orgs.items.filter((obj) => obj.name == orgName)[0];

    const projectName = await createNewProject(page);
    const projects = JSON.parse(
      execSync('boundary scopes list -format json -scope-id ' + org.id),
    );
    const project = projects.items.filter((obj) => obj.name == projectName)[0];

    const targetName = await createTcpTargetWithAddressEnt(page);
    const targets = JSON.parse(
      execSync('boundary targets list -format json -scope-id ' + project.id),
    );
    const target = targets.items.filter((obj) => obj.name == targetName)[0];

    connect = await connectToTarget(target.id);
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

test('Verify session created for SSH target @ent @aws @docker', async ({
  page,
}) => {
  await page.goto('/');
  let org;
  let connect;
  try {
    const orgName = await createNewOrg(page);
    await authenticateBoundaryCli();
    const orgs = JSON.parse(execSync('boundary scopes list -format json'));
    org = orgs.items.filter((obj) => obj.name == orgName)[0];

    const projectName = await createNewProject(page);
    const projects = JSON.parse(
      execSync('boundary scopes list -format json -scope-id ' + org.id),
    );
    const project = projects.items.filter((obj) => obj.name == projectName)[0];

    const targetName = await createSshTargetWithAddressEnt(page);
    const targets = JSON.parse(
      execSync('boundary targets list -format json -scope-id ' + project.id),
    );
    const target = targets.items.filter((obj) => obj.name == targetName)[0];

    await createStaticCredentialStore(page);
    const credentialName = await createStaticCredentialKeyPair(page);
    await addInjectedCredentialsToTarget(page, targetName, credentialName);

    connect = await connectSshToTarget(target.id);
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
