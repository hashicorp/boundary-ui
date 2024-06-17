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
  deleteOrgCli,
} = require('../helpers/boundary-cli');
const {
  addBrokeredCredentialsToTarget,
  addInjectedCredentialsToTarget,
  createOrg,
  createProject,
  createSshTargetWithAddressEnt,
  createStaticCredentialKeyPair,
  createStaticCredentialStore,
  createStaticCredentialUsernamePassword,
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

test('Multiple Credential Stores (ENT) @ent @aws @docker', async ({ page }) => {
  let orgName;
  try {
    await page.goto('/');

    orgName = await createOrg(page);
    await createProject(page);
    const targetName = await createSshTargetWithAddressEnt(
      page,
      process.env.E2E_TARGET_ADDRESS,
      process.env.E2E_TARGET_PORT,
    );
    await createStaticCredentialStore(page);

    const credentialName = await createStaticCredentialKeyPair(
      page,
      process.env.E2E_SSH_USER,
      process.env.E2E_SSH_KEY_PATH,
    );
    const credentialName2 = await createStaticCredentialUsernamePassword(
      page,
      process.env.E2E_SSH_USER,
      'testPassword',
    );

    await addBrokeredCredentialsToTarget(page, targetName, credentialName);
    await addBrokeredCredentialsToTarget(page, targetName, credentialName2);

    // Remove a credential from the target
    await page
      .getByRole('link', { name: credentialName2 })
      .locator('..')
      .locator('..')
      .getByRole('button', { name: 'Manage' })
      .click();
    await page.getByRole('button', { name: 'Remove' }).click();
    await page.getByRole('button', { name: 'OK' }).click();
    await expect(
      page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss' }).click();

    await addInjectedCredentialsToTarget(page, targetName, credentialName);
    await addInjectedCredentialsToTarget(page, targetName, credentialName2);

    // Remove a credential from the target
    await page
      .getByRole('link', { name: credentialName2 })
      .locator('..')
      .locator('..')
      .getByRole('button', { name: 'Manage' })
      .click();
    await page.getByRole('button', { name: 'Remove' }).click();
    await page.getByRole('button', { name: 'OK' }).click();
    await expect(
      page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss' }).click();
  } finally {
    await authenticateBoundaryCli(
      process.env.BOUNDARY_ADDR,
      process.env.E2E_PASSWORD_AUTH_METHOD_ID,
      process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
      process.env.E2E_PASSWORD_ADMIN_PASSWORD,
    );
    const orgs = JSON.parse(execSync('boundary scopes list -format json'));
    const org = orgs.items.filter((obj) => obj.name == orgName)[0];
    if (org) {
      await deleteOrgCli(org.id);
    }
  }
});
