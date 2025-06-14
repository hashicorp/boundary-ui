/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../../global-setup.js';
import * as boundaryHttp from '../../helpers/boundary-http.js';
import * as boundaryCli from '../../helpers/boundary-cli.js';
import { RolesPage } from '../pages/roles.js';
import { expect } from '@playwright/test';

const roleNamesToCreate = ['Alpha', 'Beta', 'Delta', 'Gamma', 'Zeta'];

export const tableSortButton = (tableLocator, nth) =>
  tableLocator.locator(`thead tr th`).nth(nth).locator('button');
export const tableSortButtonUpArrow = (tableLocator, nth) =>
  tableLocator
    .locator(`thead tr th`)
    .nth(nth)
    .locator('button .hds-icon-arrow-up');
export const tableSortButtonDownArrow = (tableLocator, nth) =>
  tableLocator
    .locator(`thead tr th`)
    .nth(nth)
    .locator('button .hds-icon-arrow-down');

const columnHeadersOrder = {
  name: 0,
  id: 2,
};

let org, rolesSortedByCreatedTime, rolesSortedByName, rolesSortedById;

test.beforeEach(
  async ({
    request,
    controllerAddr,
    adminAuthMethodId,
    adminLoginName,
    adminPassword,
  }) => {
    org = await boundaryHttp.createOrg(request);

    await boundaryCli.authenticateBoundary(
      controllerAddr,
      adminAuthMethodId,
      adminLoginName,
      adminPassword,
    );

    // when the org is created some roles are created automatically, but for the purposes
    // of this sorting test it's clearer if only the roles created by the test are present
    const existingRolesToDelete = await boundaryCli.listRoles(org.id);
    for (const role of existingRolesToDelete) {
      await boundaryCli.deleteRole(role.id);
    }

    // create roles with specific names
    for (const roleName of roleNamesToCreate) {
      boundaryCli.createRole(org.id, { name: roleName });
    }

    // collect all roles and data so that sorting can be tested based on the underlying data
    const roles = await boundaryCli.listRoles(org.id);
    rolesSortedByCreatedTime = roles.toSorted((a, b) => {
      return new Date(b.created_time) - new Date(a.created_time);
    });
    rolesSortedByName = roles.toSorted((a, b) => a.name.localeCompare(b.name));
    rolesSortedById = roles.toSorted((a, b) => a.id.localeCompare(b.id));
  },
);

test.afterEach(async ({ request }) => {
  // deletes the org and any associated roles
  await boundaryHttp.deleteOrg(request, org.id);
});

test(
  'Sorting works',
  { tag: ['@ce', '@ent', '@aws', '@docker'] },
  async ({ page }) => {
    const rolesPage = new RolesPage(page);
    rolesPage.goToRolesPage({ scope: org.id });

    const table = page.locator('table');
    await expect(table.locator('tbody tr')).toHaveCount(
      roleNamesToCreate.length,
    );

    // by default, resources are sorted by created time, descending
    for (const [index, role] of Object.entries(
      rolesSortedByCreatedTime,
    ).toReversed()) {
      await expect(table.locator('tbody tr').nth(index)).toContainText(
        role.name,
      );
    }

    // click the "Name" column header to sort by name, ascending
    await tableSortButton(table, columnHeadersOrder.name).click();
    await tableSortButtonUpArrow(table, columnHeadersOrder.name).isVisible();

    for (const [index, role] of Object.entries(rolesSortedByName)) {
      await expect(table.locator('tbody tr').nth(index)).toContainText(
        role.name,
      );
    }

    // click the "Name" column header again, to sort by name, descending
    await tableSortButton(table, columnHeadersOrder.name).click();
    await tableSortButtonDownArrow(table, columnHeadersOrder.name).isVisible();
    for (const [index, role] of Object.entries(
      rolesSortedByName.toReversed(),
    )) {
      await expect(table.locator('tbody tr').nth(index)).toContainText(
        role.name,
      );
    }

    // click the "ID" column header to sort by ID, ascending
    await tableSortButton(table, columnHeadersOrder.id).click();
    await tableSortButtonUpArrow(table, columnHeadersOrder.id).isVisible();
    for (const [index, role] of Object.entries(rolesSortedById)) {
      await expect(table.locator('tbody tr').nth(index)).toContainText(
        role.name,
      );
    }

    // click the "ID" column header again, to sort by ID, descending
    await tableSortButton(table, columnHeadersOrder.id).click();
    await tableSortButtonDownArrow(table, columnHeadersOrder.id).isVisible();
    for (const [index, role] of Object.entries(rolesSortedById.toReversed())) {
      await expect(table.locator('tbody tr').nth(index)).toContainText(
        role.name,
      );
    }
  },
);
