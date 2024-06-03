/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
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
  createOrg,
  createProject,
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
    'E2E_WORKER_TAG_EGRESS',
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
    const orgName = await createOrg(page);
    await authenticateBoundaryCli(
      process.env.BOUNDARY_ADDR,
      process.env.E2E_PASSWORD_AUTH_METHOD_ID,
      process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
      process.env.E2E_PASSWORD_ADMIN_PASSWORD,
    );
    const orgs = JSON.parse(execSync('boundary scopes list -format json'));
    org = orgs.items.filter((obj) => obj.name == orgName)[0];

    const projectName = await createProject(page);
    const projects = JSON.parse(
      execSync('boundary scopes list -format json -scope-id ' + org.id),
    );
    const project = projects.items.filter((obj) => obj.name == projectName)[0];

    const targetName = await createTcpTargetWithAddressEnt(
      page,
      process.env.E2E_TARGET_ADDRESS,
      process.env.E2E_TARGET_PORT,
    );
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

test('Verify session created for SSH target @ent @aws @docker', async ({
  page,
}) => {
  await page.goto('/');
  let org;
  let connect;
  try {
    const orgName = await createOrg(page);
    await authenticateBoundaryCli(
      process.env.BOUNDARY_ADDR,
      process.env.E2E_PASSWORD_AUTH_METHOD_ID,
      process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
      process.env.E2E_PASSWORD_ADMIN_PASSWORD,
    );
    const orgs = JSON.parse(execSync('boundary scopes list -format json'));
    org = orgs.items.filter((obj) => obj.name == orgName)[0];

    const projectName = await createProject(page);
    const projects = JSON.parse(
      execSync('boundary scopes list -format json -scope-id ' + org.id),
    );
    const project = projects.items.filter((obj) => obj.name == projectName)[0];

    const targetName = await createSshTargetWithAddressEnt(
      page,
      process.env.E2E_TARGET_ADDRESS,
      process.env.E2E_TARGET_PORT,
    );
    const targets = JSON.parse(
      execSync('boundary targets list -format json -scope-id ' + project.id),
    );
    const target = targets.items.filter((obj) => obj.name == targetName)[0];

    await createStaticCredentialStore(page);
    const credentialName = await createStaticCredentialKeyPair(
      page,
      process.env.E2E_SSH_USER,
      process.env.E2E_SSH_KEY_PATH,
    );
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
