/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../../global-setup.js';
import { expect } from '@playwright/test';
import { OrgsPage } from '../pages/orgs.js';

import * as boundaryHttp from '../../helpers/boundary-http.js';

test(
  'Session picker',
  { tag: ['@ce', '@ent', '@aws', '@docker'] },
  async ({ page, request }) => {
    let org;
    try {
      // Create an org and project attached to the org
      org = await boundaryHttp.createOrg(request);
      const project = await boundaryHttp.createProject(request, org.id);

      // Choose the org from the scope picker
      await page.goto('/');
      await expect(page.getByRole('heading', { name: 'Orgs' })).toBeVisible();
      const orgsPage = new OrgsPage(page);
      await orgsPage.chooseScopeFromDropdown('Global', org.name);

      // Expect the project to be displayed on the projects page
      await expect(
        page.getByRole('link', { name: project.name }),
      ).toBeVisible();

      // Switch back to global scope
      await orgsPage.chooseScopeFromDropdown(org.name, 'Global');

      // Expect to be back on the orgs page
      await expect(page.getByRole('heading', { name: 'Orgs' })).toBeVisible();
    } finally {
      if (org.id) {
        org = await request.delete(`/v1/scopes/${org.id}`);
      }
    }
  },
);
