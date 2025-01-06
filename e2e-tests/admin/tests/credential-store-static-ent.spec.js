/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test, authenticatedState } from '../../global-setup.js';
import { expect } from '@playwright/test';
import { readFile } from 'fs/promises';

import * as boundaryCli from '../../helpers/boundary-cli';
import { CredentialStoresPage } from '../pages/credential-stores.js';
import { OrgsPage } from '../pages/orgs.js';
import { ProjectsPage } from '../pages/projects.js';
import { SessionsPage } from '../pages/sessions.js';
import { TargetsPage } from '../pages/targets.js';

test.use({ storageState: authenticatedState });

test.beforeAll(async () => {
  await boundaryCli.checkBoundaryCli();
});

test('Multiple Credential Stores (ENT) @ent @aws @docker', async ({
  page,
  baseURL,
  adminAuthMethodId,
  adminLoginName,
  adminPassword,
  sshUser,
  sshKeyPath,
  targetAddress,
  targetPort,
}) => {
  let orgName;
  try {
    await page.goto('/');

    const orgsPage = new OrgsPage(page);
    orgName = await orgsPage.createOrg();
    const projectsPage = new ProjectsPage(page);
    const projectName = await projectsPage.createProject();
    const targetsPage = new TargetsPage(page);
    const targetName = await targetsPage.createSshTargetWithAddressEnt(
      targetAddress,
      targetPort,
    );
    const credentialStoresPage = new CredentialStoresPage(page);
    await credentialStoresPage.createStaticCredentialStore();
    const credentialName =
      await credentialStoresPage.createStaticCredentialKeyPair(
        sshUser,
        sshKeyPath,
      );
    const credentialName2 =
      await credentialStoresPage.createStaticCredentialUsernamePassword(
        sshUser,
        'testPassword',
      );

    await targetsPage.addBrokeredCredentialsToTarget(
      targetName,
      credentialName,
    );
    await targetsPage.addBrokeredCredentialsToTarget(
      targetName,
      credentialName2,
    );

    // Remove a credential from the target
    await page
      .getByRole('link', { name: credentialName2 })
      .locator('..')
      .locator('..')
      .getByRole('button', { name: 'Manage' })
      .click();
    await page.getByRole('button', { name: 'Remove' }).click();
    await page.getByRole('button', { name: 'OK', exact: true }).click();
    await expect(
      page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss' }).click();

    await targetsPage.addInjectedCredentialsToTarget(
      targetName,
      credentialName,
    );
    await targetsPage.addInjectedCredentialsToTarget(
      targetName,
      credentialName2,
    );

    // Remove a credential from the target
    await page
      .getByRole('link', { name: credentialName2 })
      .locator('..')
      .locator('..')
      .getByRole('button', { name: 'Manage' })
      .click();
    await page.getByRole('button', { name: 'Remove' }).click();
    await page.getByRole('button', { name: 'OK', exact: true }).click();
    await expect(
      page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss' }).click();

    // Verify credentials
    await boundaryCli.authenticateBoundary(
      baseURL,
      adminAuthMethodId,
      adminLoginName,
      adminPassword,
    );
    const orgId = await boundaryCli.getOrgIdFromName(orgName);
    const projectId = await boundaryCli.getProjectIdFromName(
      orgId,
      projectName,
    );
    const targetId = await boundaryCli.getTargetIdFromName(
      projectId,
      targetName,
    );
    const session = await boundaryCli.authorizeSessionByTargetId(targetId);
    const retrievedUser = session.item.credentials[0].credential.username;
    const retrievedKey = session.item.credentials[0].credential.private_key;

    expect(retrievedUser).toBe(sshUser);

    const keyData = await readFile(sshKeyPath, {
      encoding: 'utf-8',
    });
    expect(retrievedKey).toBe(keyData);

    const sessionsPage = new SessionsPage(page);
    await sessionsPage.waitForSessionToBeVisible(targetName);
  } finally {
    if (orgName) {
      await boundaryCli.authenticateBoundary(
        baseURL,
        adminAuthMethodId,
        adminLoginName,
        adminPassword,
      );
      const orgId = await boundaryCli.getOrgIdFromName(orgName);
      if (orgId) {
        await boundaryCli.deleteScope(orgId);
      }
    }
  }
});
