/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../../global-setup.js';
import { RolesPage } from '../pages/roles.js';
import { expect } from '@playwright/test';

const roleNamesToCreate = ['Alpha', 'Beta', 'Delta', 'Gamma', 'Zeta'];

export const columnHeaderSortButton = (tableLocator, name) =>
  tableLocator.getByRole('columnheader', { name }).getByRole('button');

export const assertColumnHeaderSortedAscending = (tableLocator, name) =>
  expect(tableLocator.getByRole('columnheader', { name })).toHaveAttribute(
    'aria-sort',
    'ascending',
  );

export const assertColumnHeaderSortedDescending = (tableLocator, name) =>
  expect(tableLocator.getByRole('columnheader', { name })).toHaveAttribute(
    'aria-sort',
    'descending',
  );

const columnHeaders = Object.freeze({
  name: { index: 0, label: 'Name' },
  id: { index: 2, label: 'ID' },
});

let org, rolesSortedByCreatedTime, rolesSortedByName, rolesSortedById;

test.beforeEach(async ({ apiClient }) => {
  org = await apiClient.clients.Scope.scopeServiceCreateScope({
    item: {
      scopeId: 'global',
    },
    skipAdminRoleCreation: true,
    skipDefaultRoleCreation: true,
  });

  // create roles with specific names
  const roles = [];
  for (const roleName of roleNamesToCreate) {
    const role = await apiClient.clients.Role.roleServiceCreateRole({
      item: {
        scopeId: org.id,
        name: roleName,
      },
    });
    roles.push(role);
  }

  // collect all roles and data so that sorting can be tested based on the underlying data
  rolesSortedByCreatedTime = roles.toSorted((a, b) => {
    return new Date(b.createdTime) - new Date(a.createdTime);
  });
  rolesSortedByName = roles.toSorted((a, b) => a.name.localeCompare(b.name));
  rolesSortedById = roles.toSorted((a, b) => a.id.localeCompare(b.id));
});

test(
  'Sorting works',
  { tag: ['@ce', '@ent', '@aws', '@docker'] },
  async ({ page }) => {
    const rolesPage = new RolesPage(page);
    rolesPage.goToRolesPage({ scope: org.id });

    const table = page.getByRole('table');
    const tableRows = table
      .getByRole('row')
      .filter({ hasNot: page.getByRole('columnheader') });

    await expect(tableRows).toHaveCount(roleNamesToCreate.length);

    // assert that the table has the expected column headers
    for (const { label, index } of Object.values(columnHeaders)) {
      await expect(
        table.getByRole('columnheader').nth(index).getByLabel(label),
      ).toBeVisible();
    }

    // by default, resources are sorted by created time, descending
    for (const [index, role] of Object.entries(
      rolesSortedByCreatedTime,
    ).toReversed()) {
      await expect(tableRows.nth(index)).toContainText(role.name);
    }

    // click the "Name" column header to sort by name, ascending
    await columnHeaderSortButton(table, columnHeaders.name.label).click();
    await assertColumnHeaderSortedAscending(table, columnHeaders.name.label);

    for (const [index, role] of Object.entries(rolesSortedByName)) {
      await expect(tableRows.nth(index)).toContainText(role.name);
    }

    // click the "Name" column header again, to sort by name, descending
    await columnHeaderSortButton(table, columnHeaders.name.label).click();
    await assertColumnHeaderSortedDescending(table, columnHeaders.name.label);
    for (const [index, role] of Object.entries(
      rolesSortedByName.toReversed(),
    )) {
      await expect(tableRows.nth(index)).toContainText(role.name);
    }

    // click the "ID" column header to sort by ID, ascending
    await columnHeaderSortButton(table, columnHeaders.id.label).click();
    await assertColumnHeaderSortedAscending(table, columnHeaders.id.label);
    for (const [index, role] of Object.entries(rolesSortedById)) {
      await expect(tableRows.nth(index)).toContainText(role.name);
    }

    // click the "ID" column header again, to sort by ID, descending
    await columnHeaderSortButton(table, columnHeaders.id.label).click();
    await assertColumnHeaderSortedDescending(table, columnHeaders.id.label);
    for (const [index, role] of Object.entries(rolesSortedById.toReversed())) {
      await expect(tableRows.nth(index)).toContainText(role.name);
    }
  },
);
