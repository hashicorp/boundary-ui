/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect, test } from '../fixtures/baseTest.js';
import * as boundaryHttp from '../../helpers/boundary-http.js';

const targetNamesToCreate = [
  'Alpha',
  'alpha',
  'Beta',
  'Delta',
  'delta',
  'Gamma',
  'Zeta',
];
let org, targetsSortedByName;

test.beforeEach(async ({ request, targetAddress, targetPort }) => {
  org = await boundaryHttp.createOrg(request);
  const project = await boundaryHttp.createProject(request, org.id);

  // Create targets with specific names
  const targets = [];
  for (const targetName of targetNamesToCreate) {
    const target = await boundaryHttp.createTarget(request, {
      scopeId: project.id,
      type: 'tcp',
      port: targetPort,
      address: targetAddress,
      name: targetName,
    });
    targets.push(target);
  }

  targetsSortedByName = targets.toSorted((a, b) =>
    a.name.localeCompare(b.name, 'en', {
      caseFirst: 'upper',
    }),
  );
});

test.afterEach(async ({ request }) => {
  if (org) {
    await boundaryHttp.deleteOrg(request, org.id);
  }
});

test('Sorts targets table by name correctly', async ({ authedPage }) => {
  await expect(
    authedPage.getByRole('heading', { name: 'Targets' }),
  ).toBeVisible();

  // Assert table is visible and loaded before switching scopes since there is a bug
  // where page errors out if we switch scopes before the table loads.
  const table = authedPage.getByRole('table');
  await expect(table).toBeVisible();

  // Switch to org scope to see targets created in beforeEach
  const headerNavLocator = authedPage.locator(
    'header .app-header__global-actions',
  );
  await expect(headerNavLocator).toBeVisible();
  await headerNavLocator.click();
  await authedPage.getByRole('link', { name: org.name }).click();
  await expect(
    headerNavLocator.locator('.hds-dropdown-toggle-button'),
  ).toHaveText(org.name);

  const tableRows = table
    .getByRole('row')
    .filter({ hasNot: authedPage.getByRole('columnheader') });
  await expect(tableRows).toHaveCount(targetNamesToCreate.length);

  // Assert "Name" column is present
  await expect(
    table.getByRole('columnheader').nth(0).getByLabel('Name'),
  ).toBeVisible();

  const nameColumnHeader = table.getByRole('columnheader', { name: 'Name' });

  // Sort by name ascending
  await nameColumnHeader.getByRole('button').click();
  await expect(nameColumnHeader).toHaveAttribute('aria-sort', 'ascending');
  for (const [index, target] of Object.entries(targetsSortedByName)) {
    await expect(tableRows.nth(index)).toContainText(target.name);
  }

  // Sort by name descending
  await nameColumnHeader.getByRole('button').click();
  await expect(nameColumnHeader).toHaveAttribute('aria-sort', 'descending');
  for (const [index, target] of Object.entries(
    targetsSortedByName.toReversed(),
  )) {
    await expect(tableRows.nth(index)).toContainText(target.name);
  }
});
