/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../../global-setup.js';
import { expect } from '@playwright/test';
import { customAlphabet } from 'nanoid';

import { WorkersPage } from '../pages/workers.js';

test(
  'Worker Tags',
  { tag: ['@ce', '@ent', '@aws', '@docker'] },
  async ({ page }) => {
    const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 10);

    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Application local navigation' })
      .getByRole('link', { name: 'Workers' })
      .click();
    await expect(
      page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText('Workers'),
    ).toBeVisible();

    // View tags from worker list page
    const workerListHeadersCount = await page
      .getByRole('table')
      .getByRole('columnheader')
      .count();
    let workerListWorkerIndex;
    let workerListTagIndex;
    for (let i = 0; i < workerListHeadersCount; i++) {
      const header = await page
        .getByRole('table')
        .getByRole('columnheader')
        .nth(i)
        .innerText();
      if (header === 'Worker') {
        workerListWorkerIndex = i;
      } else if (header === 'Tags') {
        workerListTagIndex = i;
      }
    }
    await page
      .getByRole('table')
      .getByRole('row')
      .nth(1)
      .getByRole('cell')
      .nth(workerListTagIndex)
      .getByRole('button')
      .click();

    // Check that dialog shows a config tag
    const dialogHeadersCount = await page
      .getByRole('dialog')
      .getByRole('table')
      .getByRole('columnheader')
      .count();
    let dialogTypeIndex;
    for (let i = 0; i < dialogHeadersCount; i++) {
      const header = await page
        .getByRole('dialog')
        .getByRole('table')
        .getByRole('columnheader')
        .nth(i)
        .innerText();
      if (header === 'Type') {
        dialogTypeIndex = i;
      }
    }
    await expect(
      page
        .getByRole('dialog')
        .getByRole('table')
        .getByRole('row')
        .nth(1)
        .getByRole('cell')
        .nth(dialogTypeIndex),
    ).toHaveText('config');
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Dismiss' })
      .click();

    // Go to worker details and create a new tag
    await page
      .getByRole('table')
      .getByRole('row')
      .nth(1)
      .getByRole('cell')
      .nth(workerListWorkerIndex)
      .getByRole('link')
      .click();
    const workersPage = new WorkersPage(page);
    const tagKey = nanoid();
    const tagValue = nanoid();
    await workersPage.createNewTag(tagKey, tagValue);

    // Check tag in worker dialog
    await page
      .getByRole('navigation', { name: 'Application local navigation' })
      .getByRole('link', { name: 'Workers' })
      .click();
    await expect(
      page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText('Workers'),
    ).toBeVisible();
    await page
      .getByRole('table')
      .getByRole('row')
      .nth(1)
      .getByRole('cell')
      .nth(workerListTagIndex)
      .getByRole('button')
      .click();
    await expect(
      page
        .getByRole('dialog')
        .getByRole('table')
        .getByRole('cell', { name: tagKey + ' = ' + tagValue }),
    ).toBeVisible();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Dismiss' })
      .click();

    // Go to worker details page
    await page
      .getByRole('table')
      .getByRole('row')
      .nth(1)
      .getByRole('cell')
      .nth(workerListWorkerIndex)
      .getByRole('link')
      .click();
    await page.getByRole('link', { name: 'Tags' }).click();
    const workerDetailsHeadersCount = await page
      .getByRole('table')
      .getByRole('columnheader')
      .count();
    let workerDetailsTypeIndex;
    for (let i = 0; i < workerDetailsHeadersCount; i++) {
      const header = await page
        .getByRole('table')
        .getByRole('columnheader')
        .nth(i)
        .innerText();
      if (header === 'Type') {
        workerDetailsTypeIndex = i;
      }
    }

    // Check tags in the worker details page
    await expect(
      page
        .getByRole('table')
        .getByRole('row')
        .nth(1)
        .getByRole('cell')
        .nth(workerDetailsTypeIndex),
    ).toHaveText('config');
    await expect(
      page
        .getByRole('row')
        .filter({ has: page.getByRole('cell', { name: tagKey }) })
        .getByRole('cell', { name: tagValue }),
    ).toBeVisible();

    // Edit the tag
    const newTagKey = nanoid();
    const newTagValue = nanoid();
    await workersPage.editTag(tagKey, newTagKey, newTagValue);
    await expect(
      page
        .getByRole('row')
        .filter({ has: page.getByRole('cell', { name: newTagKey }) })
        .getByRole('cell', { name: newTagValue }),
    ).toBeVisible();

    // Delete the tag
    await workersPage.removeTag(newTagKey);
    await expect(
      page.getByRole('table').getByRole('cell', { name: newTagKey }),
    ).toBeHidden();
  },
);
