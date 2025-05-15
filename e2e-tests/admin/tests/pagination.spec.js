/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../../global-setup.js';
import { expect } from '@playwright/test';

import * as boundaryHttp from '../../helpers/boundary-http.js';

test(
  'Search and Pagination (Targets)',
  { tag: ['@ce', '@ent', '@aws', '@docker'] },
  async ({ page, request }) => {
    let org;
    try {
      org = await boundaryHttp.createOrg(request);
      const project = await boundaryHttp.createProject(request, org.id);

      // Create targets
      let targets = [];
      const targetCount = 15;
      for (let i = 0; i < targetCount; i++) {
        const target = await boundaryHttp.createTarget(request, {
          scopeId: project.id,
          type: 'tcp',
          port: 22,
        });
        targets.push(target);
      }

      // Navigate to targets page
      await page.goto('/');
      await page.getByRole('link', { name: org.name }).click();
      await page.getByRole('link', { name: project.name }).click();
      await page
        .getByRole('navigation', { name: 'Application local navigation' })
        .getByRole('link', { name: 'Targets' })
        .click();
      await expect(
        page.getByRole('heading', { name: 'Targets' }),
      ).toBeVisible();

      // Check pagination
      // The most recent target should be visible. The oldest target should not be
      // visible since there are 15 targets and the default page size is 10.
      await expect(
        page.getByRole('link', { name: targets[targets.length - 1].name }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: targets[0].name }),
      ).toBeHidden();

      // Navigate to the second page. The oldest target should now be visible.
      await page
        .getByRole('navigation', { name: 'pagination' })
        .getByRole('link', { name: 'page 2' })
        .click();
      await expect(
        page.getByRole('link', { name: targets[0].name }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: targets[targets.length - 1].name }),
      ).toBeHidden();

      // Use the "previous page" button to navigate back to the first page.
      await page
        .getByRole('navigation', { name: 'pagination' })
        .getByRole('link', { name: 'Previous page' })
        .click();
      await expect(
        page.getByRole('link', { name: targets[0].name }),
      ).toBeHidden();
      await expect(
        page.getByRole('link', { name: targets[targets.length - 1].name }),
      ).toBeVisible();

      // Use the "next page" button to navigate back to the second page.
      await page
        .getByRole('navigation', { name: 'pagination' })
        .getByRole('link', { name: 'Next page' })
        .click();
      await expect(
        page.getByRole('link', { name: targets[0].name }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: targets[targets.length - 1].name }),
      ).toBeHidden();

      // Use the search box to find the most recent target.
      await page
        .getByRole('searchbox', { name: 'Search' })
        .fill(targets[targets.length - 1].name);
      await expect(
        page.getByRole('link', { name: targets[0].name }),
      ).toBeHidden();
      await expect(
        page.getByRole('link', { name: targets[targets.length - 1].name }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: targets[targets.length - 2].name }),
      ).toBeHidden();

      // Clear the search box
      await page.getByRole('searchbox', { name: 'Search' }).clear();
      await expect(
        page.getByRole('link', { name: targets[0].name }),
      ).toBeHidden();
      await expect(
        page.getByRole('link', { name: targets[targets.length - 2].name }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: targets[targets.length - 1].name }),
      ).toBeVisible();

      // Use the "Items per page" options to show 30 items per page.
      await page
        .getByRole('combobox', { name: 'Items per page' })
        .selectOption('30');
      await expect(
        page.getByRole('link', { name: targets[0].name }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: targets[targets.length - 1].name }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: targets[targets.length - 2].name }),
      ).toBeVisible();

      // Use the "Items per page" options to show 50 items per page.
      await page
        .getByRole('combobox', { name: 'Items per page' })
        .selectOption('50');
      await expect(
        page.getByRole('link', { name: targets[0].name }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: targets[targets.length - 1].name }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: targets[targets.length - 2].name }),
      ).toBeVisible();

      // Use the "Items per page" options to show 10 items per page.
      await page
        .getByRole('combobox', { name: 'Items per page' })
        .selectOption('10');
      await expect(
        page.getByRole('link', { name: targets[0].name }),
      ).toBeHidden();
      await expect(
        page.getByRole('link', { name: targets[targets.length - 2].name }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: targets[targets.length - 1].name }),
      ).toBeVisible();
    } finally {
      if (org.id) {
        org = await request.delete(`/v1/scopes/${org.id}`);
      }
    }
  },
);

test(
  'Search and Pagination (Aliases)',
  { tag: ['@ce', '@ent', '@aws', '@docker'] },
  async ({ page, request }) => {
    let org;
    let aliases = [];
    try {
      org = await boundaryHttp.createOrg(request);
      const project = await boundaryHttp.createProject(request, org.id);

      // Create aliases
      const aliasCount = 15;
      for (let i = 0; i < aliasCount; i++) {
        const alias = await boundaryHttp.createAlias(request, {
          scopeId: "global",
          type: 'target',
          value: `value-${i}`
        });
        aliases.push(alias);
      }


      // Navigate to aliases page
      await page.goto('/');
      //await page.getByRole('link', { name: org.name }).click();
      //await page.getByRole('link', { name: project.name }).click();
      await page
        .getByRole('navigation', { name: 'Application local navigation' })
        .getByRole('link', { name: 'Aliases' })
        .click();
      await expect(
        page.getByRole('heading', { name: 'Aliases' }),
      ).toBeVisible();

      // Check pagination
      // The most recent alias should be visible. The oldest alias should not be
      // visible since there are 15 aliases and the default page size is 10.
      await expect(
        page.getByRole('link', { name: aliases[aliases.length - 1].value }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: aliases[0].value }),
      ).toBeHidden();

      // Navigate to the second page. The oldest alias should now be visible.
      await page
        .getByRole('navigation', { name: 'pagination' })
        .getByRole('link', { name: 'page 2' })
        .click();
      await expect(
        page.getByRole('link', { name: aliases[0].value }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: aliases[aliases.length - 1].value }),
      ).toBeHidden();

      // Use the "previous page" button to navigate back to the first page.
      await page
        .getByRole('navigation', { name: 'pagination' })
        .getByRole('link', { name: 'Previous page' })
        .click();
      await expect(
        page.getByRole('link', { name: aliases[0].value }),
      ).toBeHidden();
      await expect(
        page.getByRole('link', { name: aliases[aliases.length - 1].value }),
      ).toBeVisible();

      // Use the "next page" button to navigate back to the second page.
      await page
        .getByRole('navigation', { name: 'pagination' })
        .getByRole('link', { name: 'Next page' })
        .click();
      await expect(
        page.getByRole('link', { name: aliases[0].value }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: aliases[aliases.length - 1].value }),
      ).toBeHidden();

      // Use the search box to find the most recent alias.
      await page
        .getByRole('searchbox', { name: 'Search' })
        .fill(aliases[aliases.length - 1].value);
      await expect(
        page.getByRole('link', { name: aliases[0].value }),
      ).toBeHidden();
      await expect(
        page.getByRole('link', { name: aliases[aliases.length - 1].value }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: aliases[aliases.length - 2].value }),
      ).toBeHidden();

      // Clear the search box
      await page.getByRole('searchbox', { name: 'Search' }).clear();
      await expect(
        page.getByRole('link', { name: aliases[0].value }),
      ).toBeHidden();
      await expect(
        page.getByRole('link', { name: aliases[aliases.length - 2].value }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: aliases[aliases.length - 1].value }),
      ).toBeVisible();

      // Use the "Items per page" options to show 30 items per page.
      await page
        .getByRole('combobox', { name: 'Items per page' })
        .selectOption('30');
      await expect(
        page.getByRole('link', { name: aliases[0].value }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: aliases[aliases.length - 1].value }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: aliases[aliases.length - 2].value }),
      ).toBeVisible();

      // Use the "Items per page" options to show 50 items per page.
      await page
        .getByRole('combobox', { name: 'Items per page' })
        .selectOption('50');
      await expect(
        page.getByRole('link', { name: aliases[0].value }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: aliases[aliases.length - 1].value }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: aliases[aliases.length - 2].value }),
      ).toBeVisible();

      // Use the "Items per page" options to show 10 items per page.
      await page
        .getByRole('combobox', { name: 'Items per page' })
        .selectOption('10');
      await expect(
        page.getByRole('link', { name: aliases[0].value }),
      ).toBeHidden();
      await expect(
        page.getByRole('link', { name: aliases[aliases.length - 2].value }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: aliases[aliases.length - 1].value }),
      ).toBeVisible();

    } finally {
      if (aliases.length > 0) {
        for (let i = 0; i < aliases.length; i++) {
          await request.delete(`/v1/aliases/${aliases[i].id}`);
        }
      }
    }
  },
);
