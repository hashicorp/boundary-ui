/**
 * Copyright (c) HashiCorp, Inc.
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
            //Create an org and project attached to the org
            org = await boundaryHttp.createOrg(request);
            const project = await boundaryHttp.createProject(request, org.id);

            //Choose the org from the scope picker
            await page.goto('/');
            const orgsPage = new OrgsPage(page);
            await orgsPage.chooseScopeFromDropdown(org.name, org.id);

            //Expect the project to be displayed on the projects page
            await expect(
                page.getByRole('link', { name: project.name })
            ).toBeVisible()
        } finally {
            if (org.id) {
                org = await request.delete(`/v1/scopes/${org.id}`);
            }
        }
    },
);