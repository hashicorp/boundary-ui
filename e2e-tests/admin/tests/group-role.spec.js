/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../../global-setup.js';

import * as boundaryCli from '../../helpers/boundary-cli';
import { BasePage } from '../pages/base.js';
import { GroupsPage } from '../pages/groups.js';
import { OrgsPage } from '../pages/orgs.js';
import { RolesPage } from '../pages/roles.js';

test.beforeAll(async () => {
  await boundaryCli.checkBoundaryCli();
});

test(
  'Verify a new role can be created and associated with a group',
  { tag: ['@ce', '@ent', '@aws', '@docker'] },
  async ({
    page,
    controllerAddr,
    adminAuthMethodId,
    adminLoginName,
    adminPassword,
  }) => {
    let orgName;
    const basePage = new BasePage(page);
    try {
      await basePage.goToRootLoggedIn();

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
        controllerAddr,
        adminAuthMethodId,
        adminLoginName,
        adminPassword,
      );
      const orgId = await boundaryCli.getOrgIdFromName(orgName);
      if (orgId) {
        await boundaryCli.deleteScope(orgId);
      }
    }
  },
);
