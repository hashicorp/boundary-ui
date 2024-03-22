/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

/* eslint-disable no-undef */
const { test } = require('@playwright/test');
const { execSync } = require('child_process');
const { authenticatedState } = require('../helpers/general');
const {
  authenticateBoundaryCli,
  checkBoundaryCli,
  deleteOrgCli,
} = require('../helpers/boundary-cli');
const {
  createOrg,
  createPasswordAuthMethod,
  addAccountToAuthMethod,
  setPasswordToAccount,
  createUser,
  addAccountToUser,
  makeAuthMethodPrimary,
} = require('../helpers/boundary-ui');

test.use({ storageState: authenticatedState });

test.beforeAll(async () => {
  await checkBoundaryCli();
});

test('Verify new auth-method can be created and assigned to users @ce @ent @aws @docker', async ({
  page,
}) => {
  await page.goto('/');
  let org;
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
    await createPasswordAuthMethod(page);
    await addAccountToAuthMethod(
      page,
      'UI Test Account',
      'test-user',
      'password',
    );
    await setPasswordToAccount(page, 'password2');
    await makeAuthMethodPrimary(page);
    await createUser(page);
    await addAccountToUser(page);
  } finally {
    await deleteOrgCli(org.id);
  }
});
