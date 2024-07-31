/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
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
const GroupsPage = require('../pages/groups');
const OrgsPage = require('../pages/orgs');
const RolesPage = require('../pages/roles');

test.use({ storageState: authenticatedState });

test.beforeAll(async () => {
  await checkBoundaryCli();
});

test('Verify a new role can be created and associated with a group @ce @ent @aws @docker', async ({
  page,
}) => {
  await page.goto('/');
  let orgName;
  try {
    const orgsPage = new OrgsPage(page);
    orgName = await orgsPage.createOrg();
    const groupsPage = new GroupsPage(page);
    const groupName = await groupsPage.createGroup();
    await groupsPage.addMemberToGroup('admin');
    const rolesPage = new RolesPage(page);
    await rolesPage.createRole();
    await rolesPage.addPrincipalToRole(groupName);
    await rolesPage.addGrantsToRole('ids=*;type=*;actions=read,list');
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
