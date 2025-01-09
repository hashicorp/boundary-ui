/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect, test } from '../fixtures/baseTest.js';
import * as boundaryHttp from '../../helpers/boundary-http.js';

let orgA;
let projectA;
let targetA;

let orgB;
let projectB;
let targetB;

test.beforeEach(async ({ request, targetAddress, targetPort }) => {
  // Group A resources
  orgA = await boundaryHttp.createOrg(request);
  projectA = await boundaryHttp.createProject(request, orgA.id);
  targetA = await boundaryHttp.createTarget(request, {
    scopeId: projectA.id,
    type: 'tcp',
    port: targetPort,
    address: targetAddress,
  });

  // Group B resources
  orgB = await boundaryHttp.createOrg(request);
  projectB = await boundaryHttp.createProject(request, orgB.id);
  targetB = await boundaryHttp.createTarget(request, {
    scopeId: projectB.id,
    type: 'tcp',
    port: targetPort,
    address: targetAddress,
  });
});

test.afterEach(async ({ request }) => {
  if (orgA) {
    await boundaryHttp.deleteOrg(request, orgA.id);
  }

  if (orgB) {
    await boundaryHttp.deleteOrg(request, orgB.id);
  }
});

test.describe('Scope tests', async () => {
  test('Shows the filtered targets based on selected scope', async ({
    authedPage,
  }) => {
    const headerNavLocator = await authedPage.getByLabel('header-nav');
    await expect(headerNavLocator).toBeVisible();
    await expect(headerNavLocator.locator('summary')).toHaveText('Global');

    await expect(
      authedPage.getByRole('link', { name: targetA.name }),
    ).toBeVisible();
    await expect(
      authedPage.getByRole('link', { name: targetB.name }),
    ).toBeVisible();

    await headerNavLocator.click();
    const orgAHeaderNavLink = await authedPage.getByRole('link', {
      name: orgA.name,
    });
    await orgAHeaderNavLink.click();

    await expect(headerNavLocator.locator('summary')).toHaveText(orgA.name);
    await expect(
      authedPage.getByRole('link', { name: targetA.name }),
    ).toBeVisible();
    await expect(
      authedPage.getByRole('link', { name: targetB.name }),
    ).not.toBeVisible();

    await headerNavLocator.click();
    const orgBHeaderNavLink = await authedPage.getByRole('link', {
      name: orgB.name,
    });
    await orgBHeaderNavLink.click();

    await expect(headerNavLocator.locator('summary')).toHaveText(orgB.name);
    await expect(
      authedPage.getByRole('link', { name: targetB.name }),
    ).toBeVisible();
    await expect(
      authedPage.getByRole('link', { name: targetA.name }),
    ).not.toBeVisible();
  });
});
