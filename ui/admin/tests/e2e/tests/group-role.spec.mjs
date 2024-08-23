/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '@playwright/test';

import { authenticatedState } from '../global-setup.mjs';
import {
  authenticateBoundaryCli,
  checkBoundaryCli,
  deleteScopeCli,
  getOrgIdFromNameCli,
} from '../helpers/boundary-cli.mjs';
import { GroupsPage } from '../pages/groups.mjs';
import { OrgsPage } from '../pages/orgs.mjs';
import { RolesPage } from '../pages/roles.mjs';

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
    const orgId = await getOrgIdFromNameCli(orgName);
    if (orgId) {
      await deleteScopeCli(orgId);
    }
  }
});
