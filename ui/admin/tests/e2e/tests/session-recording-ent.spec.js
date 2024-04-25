/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

/* eslint-disable no-undef */
const { test, expect } = require('@playwright/test');
const { execSync } = require('child_process');
const { checkEnv, authenticatedState } = require('../helpers/general');
const {
  authenticateBoundaryCli,
  checkBoundaryCli,
  connectSshToTarget,
  deleteOrgCli,
  waitForSessionRecordingCli,
  deleteStorageBucketCli,
  deletePolicyCli,
} = require('../helpers/boundary-cli');
const {
  createSshTargetWithAddressAndWorkerFilterEnt,
  waitForSessionToBeVisible,
  createStorageBucket,
  enableSessionRecording,
  createStoragePolicy,
  attachStoragePolicy,
  createOrg,
  createProject,
  createStaticCredentialStore,
  createStaticCredentialKeyPair,
  addInjectedCredentialsToTarget,
} = require('../helpers/boundary-ui');

test.use({ storageState: authenticatedState });

test.beforeAll(async () => {
  await checkEnv([
    'E2E_SSH_USER',
    'E2E_SSH_KEY_PATH',
    'E2E_TARGET_ADDRESS',
    'E2E_TARGET_PORT',
    'E2E_AWS_BUCKET_NAME',
    'E2E_AWS_REGION',
    'E2E_AWS_ACCESS_KEY_ID',
    'E2E_AWS_SECRET_ACCESS_KEY',
    'E2E_WORKER_TAG_EGRESS',
  ]);

  await checkBoundaryCli();
});

test('Verify session recording can be deleted @ent @aws', async ({ page }) => {
  await page.goto('/');
  let orgId;
  let storagePolicy;
  let storageBucket;
  let connect;
  try {
    // Create org
    const orgName = await createOrg(page);
    await authenticateBoundaryCli(
      process.env.BOUNDARY_ADDR,
      process.env.E2E_PASSWORD_AUTH_METHOD_ID,
      process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
      process.env.E2E_PASSWORD_ADMIN_PASSWORD,
    );
    const orgs = JSON.parse(execSync('boundary scopes list -format json'));
    const org = orgs.items.filter((obj) => obj.name == orgName)[0];
    orgId = org.id;

    // Create project
    const projectName = await createProject(page);
    const projects = JSON.parse(
      execSync('boundary scopes list -format json -scope-id ' + org.id),
    );
    const project = projects.items.filter((obj) => obj.name == projectName)[0];
    const projectId = project.id;

    // Create storage bucket
    await page.getByRole('link', { name: 'Orgs', exact: true }).click();
    const storageBucketName = await createStorageBucket(
      page,
      orgName,
      process.env.E2E_AWS_BUCKET_NAME,
      process.env.E2E_AWS_REGION,
      process.env.E2E_AWS_ACCESS_KEY_ID,
      process.env.E2E_AWS_SECRET_ACCESS_KEY,
      `"${process.env.E2E_WORKER_TAG_EGRESS}" in "/tags/type"`,
    );
    const storageBuckets = JSON.parse(
      execSync('boundary storage-buckets list --recursive -format json'),
    );
    storageBucket = storageBuckets.items.filter(
      (obj) => obj.name == storageBucketName,
    )[0];

    // Create target
    await page.getByRole('link', { name: 'Orgs', exact: true }).click();
    await page.getByRole('link', { name: orgName }).click();
    await page.getByRole('link', { name: projectName }).click();
    const targetName = await createSshTargetWithAddressAndWorkerFilterEnt(
      page,
      process.env.E2E_TARGET_ADDRESS,
      process.env.E2E_TARGET_PORT,
      `"${process.env.E2E_WORKER_TAG_EGRESS}" in "/tags/type"`,
    );
    const targets = JSON.parse(
      execSync('boundary targets list -format json -scope-id ' + projectId),
    );
    const target = targets.items.filter((obj) => obj.name == targetName)[0];
    await createStaticCredentialStore(page);
    const credentialName = await createStaticCredentialKeyPair(
      page,
      process.env.E2E_SSH_USER,
      process.env.E2E_SSH_KEY_PATH,
    );
    await addInjectedCredentialsToTarget(page, targetName, credentialName);
    await page.getByRole('link', { name: targetName }).click();
    await enableSessionRecording(page, storageBucketName);

    // Create storage policy in org scope: keep session recordings forever
    await page.getByRole('link', { name: 'Orgs', exact: true }).click();
    await page.getByRole('link', { name: orgName }).click();
    const policyName = await createStoragePolicy(page);
    await attachStoragePolicy(page, policyName);

    // Establish connection to target and cancel it
    connect = await connectSshToTarget(target.id);
    await page.getByRole('link', { name: 'Projects', exact: true }).click();
    await page.getByRole('link', { name: projectName }).click();
    await waitForSessionToBeVisible(page, targetName);
    await page
      .getByRole('cell', { name: targetName })
      .locator('..')
      .getByRole('button', { name: 'Cancel' })
      .click();
    await expect(
      page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss', exact: true }).click();
    await waitForSessionRecordingCli(storageBucket.id);

    // Play back session recording
    await page.getByRole('link', { name: 'Orgs', exact: true }).click();
    await page
      .getByRole('navigation', { name: 'General' })
      .getByRole('link', { name: 'Session Recordings', exact: true })
      .click();
    await page
      .getByRole('row', { name: targetName })
      .getByRole('link', { name: 'View' })
      .click();
    await page
      .getByRole('cell', { name: 'Channel 1' })
      .locator('..')
      .getByRole('link', { name: 'Play' })
      .click();
    await page.locator('div.session-recording-player').hover();
    await page.locator('.ap-playback-button').click();

    // Try to delete session recording: expect failure
    await page.getByRole('link', { name: 'Orgs', exact: true }).click();
    await page
      .getByRole('navigation', { name: 'General' })
      .getByRole('link', { name: 'Session Recordings', exact: true })
      .click();
    await page
      .getByRole('row', { name: targetName })
      .getByRole('link', { name: 'View' })
      .click();
    await page.getByText('Manage').click();
    await page.getByRole('button', { name: 'Delete recording' }).click();
    await page.getByRole('button', { name: 'OK', exact: true }).click();
    await expect(
      page.getByRole('alert').getByText('Error', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss' }).click();

    // Edit storage policy: do not protect from deletion
    const storagePolicies = JSON.parse(
      execSync('boundary policies list -format json -scope-id ' + orgId),
    );
    storagePolicy = storagePolicies.items.filter(
      (obj) => obj.name == policyName,
    )[0];
    await page.getByRole('link', { name: 'Orgs', exact: true }).click();
    await page.getByRole('link', { name: orgName }).click();
    await page
      .getByRole('link', { name: 'Storage Policies', exact: true })
      .click();
    await page.getByRole('link', { name: policyName }).click();
    await page.getByRole('button', { name: 'Edit form' }).click();
    await page
      .getByLabel('Retention Policy')
      .selectOption({ label: 'Do not protect, allow deletion any time' });
    await page.getByLabel('Deletion Policy').selectOption({ label: 'Custom' });
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(
      page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss' }).click();

    // BUG? After the error trying to delete the session recording, subsequent
    // actions result in an error. Reloading the page fixes the issue. This is a
    // temporary workaround.
    await page.reload();

    // Re-apply storage policy to the session recording
    await page.getByRole('link', { name: 'Orgs', exact: true }).click();
    await page
      .getByRole('link', { name: 'Session Recordings', exact: true })
      .click();
    await page
      .getByRole('row', { name: targetName })
      .getByRole('link', { name: 'View' })
      .click();
    await page.getByText('Manage').click();
    await page.getByRole('button', { name: 'Re-apply storage policy' }).click();
    await expect(
      page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss' }).click();

    // Delete session recording
    await page.getByText('Manage').click();
    await page.getByRole('button', { name: 'Delete recording' }).click();
    await page.getByRole('button', { name: 'OK' }).click();
    await expect(
      page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss' }).click();
  } finally {
    if (storagePolicy) {
      await deletePolicyCli(storagePolicy.id);
    }
    if (orgId) {
      await deleteOrgCli(orgId);
    }
    if (storageBucket) {
      await deleteStorageBucketCli(storageBucket.id);
    }
    // End `boundary connect` process
    if (connect) {
      connect.kill('SIGTERM');
    }
  }
});
