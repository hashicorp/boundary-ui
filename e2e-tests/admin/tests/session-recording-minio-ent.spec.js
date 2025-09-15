/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../../global-setup.js';
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

test.beforeAll(async () => {
  await boundaryCli.checkBoundaryCli();
});

test(
  'Session Recording Test (MinIO)',
  { tag: ['@ent', '@docker'] },
  async ({
    page,
    controllerAddr,
    adminAuthMethodId,
    adminLoginName,
    adminPassword,
    bucketAccessKeyId,
    bucketEndpointUrl,
    bucketName,
    bucketSecretAccessKey,
    region,
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
      await boundaryCli.authenticateBoundary(
        controllerAddr,
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
      await page
        .getByRole('link', { name: `Back to ${orgName}`, exact: true })
        .click();
      await page
        .getByRole('link', { name: 'Back to Global', exact: true })
        .click();
      await page
        .getByRole('link', { name: 'Storage Buckets', exact: true })
        .click();
      const storageBucketsPage = new StorageBucketsPage(page);
      const storageBucketName =
        await storageBucketsPage.createStorageBucketMinio(
          orgName,
          bucketEndpointUrl,
          bucketName,
          region,
          bucketAccessKeyId,
          bucketSecretAccessKey,
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
      const targetName = await targetsPage.createTargetWithAddressEnt(
        targetAddress,
        targetPort,
        'ssh',
      );
      await targetsPage.addIngressWorkerFilterToTarget(
        `"${workerTagEgress}" in "/tags/type"`,
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
      await page
        .getByRole('link', { name: `Back to ${orgName}`, exact: true })
        .click();
      await page
        .getByRole('link', { name: 'Storage Policies', exact: true })
        .click();
      const storagePoliciesPage = new StoragePoliciesPage(page);
      policyName = await storagePoliciesPage.createStoragePolicy();
      await orgsPage.attachStoragePolicy(policyName);

      // Establish connection to target and cancel it
      orgId = await boundaryCli.getOrgIdFromName(orgName);
      const projectId = await boundaryCli.getProjectIdFromName(
        orgId,
        projectName,
      );
      const targetId = await boundaryCli.getTargetIdFromName(
        projectId,
        targetName,
      );
      connect = await boundaryCli.connectSshToTarget(targetId);
      await page.getByRole('link', { name: 'Projects', exact: true }).click();
      await page.getByRole('link', { name: projectName }).click();
      const sessionsPage = new SessionsPage(page);
      await sessionsPage.waitForSessionToBeVisible(targetName);
      await page
        .getByRole('row')
        .filter({ has: page.getByRole('cell', { name: targetName }) })
        .getByRole('button', { name: 'Cancel' })
        .click();
      await expect(
        page.getByRole('alert').getByText('Success', { exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Dismiss', exact: true }).click();
      await boundaryCli.waitForSessionRecording(storageBucket.id);

      // Play back session recording
      await page
        .getByRole('link', { name: `Back to ${orgName}`, exact: true })
        .click();
      await page
        .getByRole('link', { name: 'Back to Global', exact: true })
        .click();
      await page
        .getByRole('navigation', { name: 'Application local navigation' })
        .getByRole('link', { name: 'Session Recordings', exact: true })
        .click();
      await page
        .getByRole('row', { name: targetName })
        .getByRole('link', { name: 'View' })
        .click();
      await page
        .getByRole('row')
        .filter({ has: page.getByRole('cell', { name: 'Channel 1' }) })
        .getByRole('link', { name: 'Play' })
        .click();
      await page.locator('div.session-recording-player').hover();
      await page.locator('.ap-playback-button').click();

      // Edit storage policy: do not protect from deletion
      await page
        .getByRole('link', { name: 'Storage Policies', exact: true })
        .click();
      await page.getByRole('link', { name: policyName }).click();
      await page.getByRole('button', { name: 'Edit form' }).click();
      await page
        .getByLabel('Retention Policy')
        .selectOption({ label: 'Do not protect, allow deletion any time' });
      await page
        .getByLabel('Deletion Policy')
        .selectOption({ label: 'Custom' });
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(
        page.getByRole('alert').getByText('Success', { exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Dismiss' }).click();

      // Re-apply storage policy to the session recording and delete
      await page
        .getByRole('link', { name: 'Back to Global', exact: true })
        .click();
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
      await page
        .getByRole('link', { name: 'Back to Global', exact: true })
        .click();
      await expect(page.getByRole('heading', { name: 'Orgs' })).toBeVisible();
      await page.getByRole('link', { name: orgName }).click();
      await page.getByRole('link', { name: projectName }).click();
      await page.getByRole('link', { name: 'Targets', exact: true }).click();
      await page.getByRole('link', { name: targetName }).click();
      await targetsPage.detachStorageBucket();
    } finally {
      // End `boundary connect` process
      if (connect) {
        connect.kill('SIGTERM');
      }

      if (policyName) {
        const storagePolicyId = await boundaryCli.getPolicyIdFromName(
          orgId,
          policyName,
        );
        await boundaryCli.deletePolicy(storagePolicyId);
      }
      if (storageBucket) {
        await boundaryCli.deleteStorageBucket(storageBucket.id);
      }
      if (orgId) {
        await boundaryCli.deleteScope(orgId);
      }
    }
  },
);
