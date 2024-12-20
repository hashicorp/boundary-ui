/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test, authenticatedState } from '../../global-setup.js';

import * as boundaryCli from '../../helpers/boundary-cli';
import { GroupsPage } from '../pages/groups.js';
import { OrgsPage } from '../pages/orgs.js';
import { RolesPage } from '../pages/roles.js';

test.use({ storageState: authenticatedState });

test.beforeAll(async () => {
  await boundaryCli.checkBoundaryCli();
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
});
