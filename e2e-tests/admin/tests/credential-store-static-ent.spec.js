/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test, authenticatedState } from '../../global-setup.js';
import { expect } from '@playwright/test';

import * as boundaryCli from '../../helpers/boundary-cli';
import { CredentialStoresPage } from '../pages/credential-stores.js';
import { OrgsPage } from '../pages/orgs.js';
import { ProjectsPage } from '../pages/projects.js';
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
    await projectsPage.createProject();
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
  } finally {
    if (orgName) {
      await boundaryCli.authenticateBoundaryCli(
        baseURL,
        adminAuthMethodId,
        adminLoginName,
        adminPassword,
      );
      const orgId = await boundaryCli.getOrgIdFromNameCli(orgName);
      if (orgId) {
        await boundaryCli.deleteScopeCli(orgId);
      }
    }
  }
});
