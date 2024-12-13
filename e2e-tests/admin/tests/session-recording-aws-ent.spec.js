/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test, authenticatedState } from '../../global-setup.js';
import { expect } from '@playwright/test';
import { execSync } from 'child_process';

import * as boundaryCli from '../../helpers/boundary-cli';
import { CredentialStoresPage } from '../pages/credential-stores.js';
import { OrgsPage } from '../pages/orgs.js';
import { ProjectsPage } from '../pages/projects.js';
import { SessionRecordingsPage } from '../pages/session-recordings.js';
import { SessionsPage } from '../pages/sessions.js';
import { StorageBucketsPage } from '../pages/storage-buckets.js';
import { StoragePoliciesPage } from '../pages/storage-policies.js';
import { TargetsPage } from '../pages/targets.js';

test.use({ storageState: authenticatedState });

test.beforeAll(async () => {
  await boundaryCli.checkBoundaryCli();
});

test('Session Recording Test (AWS) @ent @aws', async ({
  page,
  baseURL,
  adminAuthMethodId,
  adminLoginName,
  adminPassword,
  awsAccessKeyId,
  awsBucketName,
  awsRegion,
  awsSecretAccessKey,
  sshUser,
  sshKeyPath,
  targetAddress,
  targetPort,
  workerTagEgress,
}) => {
  await page.goto('/');
  let orgId;
  let policyName;
  let storageBucket;
  let connect;
  try {
    await boundaryCli.authenticateBoundaryCli(
      baseURL,
      adminAuthMethodId,
      adminLoginName,
      adminPassword,
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
      awsBucketName,
      awsRegion,
      awsAccessKeyId,
      awsSecretAccessKey,
      `"${workerTagEgress}" in "/tags/type"`,
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
      targetAddress,
      targetPort,
    );
    await targetsPage.addEgressWorkerFilterToTarget(
      `"${workerTagEgress}" in "/tags/type"`,
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
    orgId = await boundaryCli.getOrgIdFromNameCli(orgName);
    const projectId = await boundaryCli.getProjectIdFromNameCli(
      orgId,
      projectName,
    );
    const targetId = await boundaryCli.getTargetIdFromNameCli(
      projectId,
      targetName,
    );
    connect = await boundaryCli.connectSshToTarget(targetId);
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
    await boundaryCli.waitForSessionRecordingCli(storageBucket.id);

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
      const storagePolicyId = await boundaryCli.getPolicyIdFromNameCli(
        orgId,
        policyName,
      );
      await boundaryCli.deletePolicyCli(storagePolicyId);
    }
    if (storageBucket) {
      await boundaryCli.deleteStorageBucketCli(storageBucket.id);
    }
    if (orgId) {
      await boundaryCli.deleteScopeCli(orgId);
    }
    // End `boundary connect` process
    if (connect) {
      connect.kill('SIGTERM');
    }
  }
});
