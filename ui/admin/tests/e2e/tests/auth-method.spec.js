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
  deleteOrg,
} = require('../helpers/boundary-cli');
const {
  createNewOrg,
  createNewAuthMethod,
  addAccountToAuthMethod,
  setPasswordToAccount,
  createNewUser,
  addAccountToUser,
  makeAuthMethodPrimary,
} = require('../helpers/boundary-ui');

test.use({ storageState: authenticatedState });

test.beforeAll(async () => {
  await checkBoundaryCli();
});

test('Verify new auth-method can be created and assigned to users', async ({
  page,
}) => {
  await page.goto('/');
  let org;
  try {
    const orgName = await createNewOrg(page);
    await authenticateBoundaryCli();
    const orgs = JSON.parse(execSync('boundary scopes list -format json'));
    org = orgs.items.filter((obj) => obj.name == orgName)[0];

    await createNewAuthMethod(page, 'UI Test Auth Method');
    await addAccountToAuthMethod(
      page,
      'UI Test Account',
      'test-user',
      'password'
    );
    await setPasswordToAccount(page, 'password2');
    await makeAuthMethodPrimary(page);
    await createNewUser(page, 'UI Test User');
    await addAccountToUser(page);
  } finally {
    await deleteOrg(org.id);
  }
});
