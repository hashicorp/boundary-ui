/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../playwright.config.mjs'
import { expect } from '@playwright/test';

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
  baseURL,
  adminAuthMethodId,
  adminLoginName,
  adminPassword,
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
      baseURL,
      adminAuthMethodId,
      adminLoginName,
      adminPassword,
    );
    const orgId = await getOrgIdFromNameCli(orgName);
    if (orgId) {
      await deleteScopeCli(orgId);
    }
  }
});
