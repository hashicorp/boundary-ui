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
  createNewOrg,
  createNewGroup,
  addMemberToGroup,
  createRole,
  addPrincipalToRole,
  addGrantsToGroup,
} = require('../helpers/boundary-ui');

test.use({ storageState: authenticatedState });

test.beforeAll(async () => {
  await checkBoundaryCli();
});

test('Verify a new role can be created and associated with a group @ce @ent @aws @docker', async ({
  page,
}) => {
  await page.goto('/');
  let org;
  try {
    const orgName = await createNewOrg(page);
    await authenticateBoundaryCli();
    const orgs = JSON.parse(execSync('boundary scopes list -format json'));
    org = orgs.items.filter((obj) => obj.name == orgName)[0];
    const groupName = 'test-group';
    await createNewGroup(page, groupName);
    await addMemberToGroup(page, 'admin');
    await createRole(page);
    await addPrincipalToRole(page, groupName);
    await addGrantsToGroup(page, 'ids=*;type=*;actions=read,list');
  } finally {
    await deleteOrgCli(org.id);
  }
});
