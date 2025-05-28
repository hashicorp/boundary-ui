/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect, test } from '../fixtures/baseTest.js';
import * as boundaryHttp from '../../helpers/boundary-http.js';

let hosts = [];
let org;
let targetWithManyHosts;

test.beforeEach(async ({ request, targetAddress, targetPort }) => {
  org = await boundaryHttp.createOrg(request);
  const project = await boundaryHttp.createProject(request, org.id);

  // Create host set
  const hostCatalog = await boundaryHttp.createStaticHostCatalog(
    request,
    project.id,
  );

  // Create hosts
  const hostCount = 15;
  for (let i = 0; i < hostCount; i++) {
    const host = await boundaryHttp.createHost(request, {
      hostCatalogId: hostCatalog.id,
      address: targetAddress,
      name: `Host ${i + 1}`,
    });
    hosts.push(host);
  }

  const hostSet = await boundaryHttp.createHostSet(request, hostCatalog.id);
  await boundaryHttp.addHostToHostSet(request, {
    hostSet,
    hostIds: hosts.map((host) => host.id),
  });

  // Create target
  targetWithManyHosts = await boundaryHttp.createTarget(request, {
    scopeId: project.id,
    type: 'tcp',
    port: targetPort,
  });
  targetWithManyHosts = await boundaryHttp.addHostSource(request, {
    target: targetWithManyHosts,
    hostSourceIds: [hostSet.id],
  });
});

test.afterEach(async ({ request }) => {
  if (org) {
    await boundaryHttp.deleteOrg(request, org.id);
  }
});

test.describe('Target with many hosts', () => {
  // TODO: Add tests for searching host sources
  test('should display all hosts in the target', async ({ authedPage }) => {
    await authedPage
      .getByRole('link', { name: targetWithManyHosts.name })
      .click();

    // Check pagination
    await expect(
      authedPage.getByRole('cell', { name: hosts[0].name, exact: true }),
    ).toBeVisible();
    await expect(
      authedPage.getByRole('cell', {
        name: hosts[hosts.length - 1].name,
        exact: true,
      }),
    ).toBeHidden();

    // Navigate to the second page. The last host should now be visible.
    await authedPage
      .getByRole('navigation', { name: 'pagination' })
      .getByRole('button', { name: 'page 2' })
      .click();
    await expect(
      authedPage.getByRole('cell', { name: hosts[0].name, exact: true }),
    ).toBeHidden();
    await expect(
      authedPage.getByRole('cell', {
        name: hosts[hosts.length - 1].name,
        exact: true,
      }),
    ).toBeVisible();

    // Use the "previous page" button to navigate back to the first page.
    await authedPage
      .getByRole('navigation', { name: 'pagination' })
      .getByRole('button', { name: 'Previous page' })
      .click();
    await expect(
      authedPage.getByRole('cell', { name: hosts[0].name, exact: true }),
    ).toBeVisible();
    await expect(
      authedPage.getByRole('cell', {
        name: hosts[hosts.length - 1].name,
        exact: true,
      }),
    ).toBeHidden();

    // Use the "next page" button to navigate to the second page again.
    await authedPage
      .getByRole('navigation', { name: 'pagination' })
      .getByRole('button', { name: 'Next page' })
      .click();
    await expect(
      authedPage.getByRole('cell', { name: hosts[0].name, exact: true }),
    ).toBeHidden();
    await expect(
      authedPage.getByRole('cell', {
        name: hosts[hosts.length - 1].name,
        exact: true,
      }),
    ).toBeVisible();

    // Use the "Items per page" options to show 30 items per page.
    await authedPage
      .getByRole('combobox', { name: 'Items per page' })
      .selectOption('30');
    await expect(
      authedPage.getByRole('cell', { name: hosts[0].name, exact: true }),
    ).toBeVisible();
    await expect(
      authedPage.getByRole('cell', {
        name: hosts[hosts.length - 1].name,
        exact: true,
      }),
    ).toBeVisible();

    // Use the "Items per page" options to show 10 items per page again.
    await authedPage
      .getByRole('combobox', { name: 'Items per page' })
      .selectOption('10');
    await expect(
      authedPage.getByRole('cell', { name: hosts[0].name, exact: true }),
    ).toBeVisible();
    await expect(
      authedPage.getByRole('cell', {
        name: hosts[hosts.length - 1].name,
        exact: true,
      }),
    ).toBeHidden();
  });
});

// TODO: Add tests for pagination of targets and sessions
