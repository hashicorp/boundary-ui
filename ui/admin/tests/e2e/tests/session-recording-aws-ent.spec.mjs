/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

import { authenticatedState } from '../global-setup.mjs';
import { checkEnv } from '../helpers/general.mjs';
import {
  authenticateBoundaryCli,
  checkBoundaryCli,
  connectSshToTarget,
  deleteScopeCli,
  waitForSessionRecordingCli,
  deleteStorageBucketCli,
  deletePolicyCli,
  getOrgIdFromNameCli,
  getPolicyIdFromNameCli,
  getProjectIdFromNameCli,
  getTargetIdFromNameCli,
} from '../helpers/boundary-cli.mjs';
import { CredentialStoresPage } from '../pages/credential-stores.mjs';
import { OrgsPage } from '../pages/orgs.mjs';
import { ProjectsPage } from '../pages/projects.mjs';
import { SessionRecordingsPage } from '../pages/session-recordings.mjs';
import { SessionsPage } from '../pages/sessions.mjs';
import { StorageBucketsPage } from '../pages/storage-buckets.mjs';
import { StoragePoliciesPage } from '../pages/storage-policies.mjs';
import { TargetsPage } from '../pages/targets.mjs';

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

test('Session Recording Test (AWS) @ent @aws', async ({ page }) => {
  await page.goto('/');
  let orgId;
  let policyName;
  let storageBucket;
  let connect;
  try {
    await authenticateBoundaryCli(
      process.env.BOUNDARY_ADDR,
      process.env.E2E_PASSWORD_AUTH_METHOD_ID,
      process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
      process.env.E2E_PASSWORD_ADMIN_PASSWORD,
    );

    // Create org
    const orgsPage = new OrgsPage(page);
    const orgName = await orgsPage.createOrg();

    // Create project
    const projectsPage = new ProjectsPage(page);
    const projectName = await projectsPage.createProject();

    // Create storage bucket
    await page.getByRole('link', { name: 'Orgs', exact: true }).click();
    const storageBucketsPage = new StorageBucketsPage(page);
    const storageBucketName = await storageBucketsPage.createStorageBucketAws(
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
    policyName = await storagePoliciesPage.createStoragePolicy();
    await orgsPage.attachStoragePolicy(policyName);

    // Establish connection to target and cancel it
    orgId = await getOrgIdFromNameCli(orgName);
    const projectId = await getProjectIdFromNameCli(orgId, projectName);
    const targetId = await getTargetIdFromNameCli(projectId, targetName);
    connect = await connectSshToTarget(targetId);
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

    // Re-apply storage policy to the session recording and delete
    await page.getByRole('link', { name: 'Orgs', exact: true }).click();
    await page
      .getByRole('link', { name: 'Session Recordings', exact: true })
      .click();
    await page
      .getByRole('row', { name: targetName })
      .getByRole('link', { name: 'View' })
      .click();
    const sessionRecordingsPage = new SessionRecordingsPage(page);
    await sessionRecordingsPage.reapplyStoragePolicy();
    await sessionRecordingsPage.deleteResource();

    // Detach storage bucket from target
    await page.getByRole('link', { name: 'Orgs', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Orgs' })).toBeVisible();
    await page.getByRole('link', { name: orgName }).click();
    await page.getByRole('link', { name: projectName }).click();
    await page.getByRole('link', { name: 'Targets', exact: true }).click();
    await page.getByRole('link', { name: targetName }).click();
    await targetsPage.detachStorageBucket();
  } finally {
    if (policyName) {
      const storagePolicyId = await getPolicyIdFromNameCli(orgId, policyName);
      await deletePolicyCli(storagePolicyId);
    }
    if (storageBucket) {
      await deleteStorageBucketCli(storageBucket.id);
    }
    if (orgId) {
      await deleteScopeCli(orgId);
    }
    // End `boundary connect` process
    if (connect) {
      connect.kill('SIGTERM');
    }
  }
});
