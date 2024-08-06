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
  connectSshToTarget,
  deleteOrgCli,
  waitForSessionRecordingCli,
  deleteStorageBucketCli,
  deletePolicyCli,
} = require('../helpers/boundary-cli');
const CredentialStoresPage = require('../pages/credential-stores');
const OrgsPage = require('../pages/orgs');
const ProjectsPage = require('../pages/projects');
const SessionsPage = require('../pages/sessions');
const StorageBucketsPage = require('../pages/storage-buckets');
const StoragePoliciesPage = require('../pages/storage-policies');
const TargetsPage = require('../pages/targets');

test.use({ storageState: authenticatedState });

test.beforeAll(async () => {
  await checkEnv([
    'E2E_SSH_USER',
    'E2E_SSH_KEY_PATH',
    'E2E_TARGET_ADDRESS',
    'E2E_TARGET_PORT',
    'E2E_BUCKET_NAME',
    'E2E_BUCKET_ENDPOINT_URL',
    'E2E_BUCKET_ACCESS_KEY_ID',
    'E2E_BUCKET_SECRET_ACCESS_KEY',
    'E2E_REGION',
  ]);

  await checkBoundaryCli();
});

test('Session Recording Test (MinIO) @ent @docker', async ({ page }) => {
  await page.goto('/');

  let orgId;
  let storagePolicy;
  let storageBucket;
  let connect;
  try {
    // Create org
    const orgsPage = new OrgsPage(page);
    const orgName = await orgsPage.createOrg();
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
    const projectsPage = new ProjectsPage(page);
    const projectName = await projectsPage.createProject();
    const projects = JSON.parse(
      execSync('boundary scopes list -format json -scope-id ' + org.id),
    );
    const project = projects.items.filter((obj) => obj.name == projectName)[0];
    const projectId = project.id;

    // Create storage bucket
    await page.getByRole('link', { name: 'Orgs', exact: true }).click();
    const storageBucketsPage = new StorageBucketsPage(page);
    const storageBucketName = await storageBucketsPage.createStorageBucketMinio(
      orgName,
      process.env.E2E_BUCKET_ENDPOINT_URL,
      process.env.E2E_BUCKET_NAME,
      process.env.E2E_REGION,
      process.env.E2E_BUCKET_ACCESS_KEY_ID,
      process.env.E2E_BUCKET_SECRET_ACCESS_KEY,
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
    await expect(page.getByRole('heading', { name: 'Orgs' })).toBeVisible();
    await page.getByRole('link', { name: orgName }).click();
    await page.getByRole('link', { name: projectName }).click();
    const targetsPage = new TargetsPage(page);
    const targetName = await targetsPage.createSshTargetWithAddressEnt(
      process.env.E2E_TARGET_ADDRESS,
      process.env.E2E_TARGET_PORT,
    );
    await targetsPage.addEgressWorkerFilterToTarget(
      `"${process.env.E2E_WORKER_TAG_EGRESS}" in "/tags/type"`,
    );

    const targets = JSON.parse(
      execSync('boundary targets list -format json -scope-id ' + projectId),
    );
    const target = targets.items.filter((obj) => obj.name == targetName)[0];
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
    await page.getByRole('link', { name: targetName }).click();
    await targetsPage.enableSessionRecording(storageBucketName);

    // Create storage policy in org scope: keep session recordings forever
    await page.getByRole('link', { name: 'Orgs', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Orgs' })).toBeVisible();
    await page.getByRole('link', { name: orgName }).click();
    await expect(
      page.getByRole('navigation', { name: 'breadcrumbs' }).getByText(orgName),
    ).toBeVisible();
    const storagePoliciesPage = new StoragePoliciesPage(page);
    const policyName = await storagePoliciesPage.createStoragePolicy();
    await orgsPage.attachStoragePolicy(policyName);

    // Establish connection to target and cancel it
    connect = await connectSshToTarget(target.id);
    await page.getByRole('link', { name: 'Projects', exact: true }).click();
    await page.getByRole('link', { name: projectName }).click();
    const sessionsPage = new SessionsPage(page);
    await sessionsPage.waitForSessionToBeVisible(targetName);
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
    await expect(page.getByRole('heading', { name: 'Orgs' })).toBeVisible();
    await page.getByRole('link', { name: orgName }).click();
    await expect(
      page.getByRole('navigation', { name: 'breadcrumbs' }).getByText(orgName),
    ).toBeVisible();
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
    await page.getByRole('button', { name: 'OK', exact: true }).click();
    await expect(
      page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss' }).click();

    // Detach storage bucket from target
    await page.getByRole('link', { name: 'Orgs', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Orgs' })).toBeVisible();
    await page.getByRole('link', { name: orgName }).click();
    await page.getByRole('link', { name: projectName }).click();
    await page.getByRole('link', { name: 'Targets', exact: true }).click();
    await page.getByRole('link', { name: targetName }).click();
    await page
      .getByRole('link', { name: 'Session Recording settings' })
      .click();
    await page.getByLabel('Record sessions for this target').uncheck();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(
      page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss' }).click();
  } finally {
    if (storagePolicy) {
      await deletePolicyCli(storagePolicy.id);
    }
    if (storageBucket) {
      await deleteStorageBucketCli(storageBucket.id);
    }
    if (orgId) {
      await deleteOrgCli(orgId);
    }
    // End `boundary connect` process
    if (connect) {
      connect.kill('SIGTERM');
    }
  }
});
