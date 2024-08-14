/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test, expect } from '@playwright/test';

import { authenticatedState } from '../global-setup';
import { checkEnv } from '../helpers/general';
import {
  authenticateBoundaryCli,
  checkBoundaryCli,
  deleteScopeCli,
  getOrgIdFromNameCli,
} from '../helpers/boundary-cli';
import { CredentialStoresPage } from '../pages/credential-stores';
import { OrgsPage } from '../pages/orgs';
import { ProjectsPage } from '../pages/projects';
import { TargetsPage } from '../pages/targets';

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

test('Multiple Credential Stores (ENT) @ent @aws @docker', async ({ page }) => {
  let orgName;
  try {
    await page.goto('/');

    const orgsPage = new OrgsPage(page);
    orgName = await orgsPage.createOrg();
    const projectsPage = new ProjectsPage(page);
    await projectsPage.createProject();
    const targetsPage = new TargetsPage(page);
    const targetName = await targetsPage.createSshTargetWithAddressEnt(
      process.env.E2E_TARGET_ADDRESS,
      process.env.E2E_TARGET_PORT,
    );
    const credentialStoresPage = new CredentialStoresPage(page);
    await credentialStoresPage.createStaticCredentialStore();
    const credentialName =
      await credentialStoresPage.createStaticCredentialKeyPair(
        process.env.E2E_SSH_USER,
        process.env.E2E_SSH_KEY_PATH,
      );
    const credentialName2 =
      await credentialStoresPage.createStaticCredentialUsernamePassword(
        process.env.E2E_SSH_USER,
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
      await authenticateBoundaryCli(
        process.env.BOUNDARY_ADDR,
        process.env.E2E_PASSWORD_AUTH_METHOD_ID,
        process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
        process.env.E2E_PASSWORD_ADMIN_PASSWORD,
      );
      const orgId = await getOrgIdFromNameCli(orgName);
      if (orgId) {
        await deleteScopeCli(orgId);
      }
    }
  }
});
