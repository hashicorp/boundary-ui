/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

/* eslint-disable no-undef */
const { expect } = require('@playwright/test');
const { test } = require('@playwright/test');
const { checkEnv, authenticatedState } = require('../helpers/general');
const { checkBoundaryCli } = require('../helpers/boundary-cli');

test.use({ storageState: authenticatedState });

test.beforeAll(async () => {
  await checkEnv(['E2E_WORKER_TOKEN']);

  await checkBoundaryCli();
});

test('Create a worker @ce @ent @docker', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('navigation', { name: 'General' })
    .getByRole('link', { name: 'Workers' })
    .click();
  await page.getByRole('link', { name: 'New', exact: true }).click();

  // Populate config fields
  await page.getByLabel('Worker public address').fill('worker1.example.com');
  await page.getByLabel('Config file path').fill('/home/ubuntu/boundary');
  await page.getByLabel('Initial upstreams').fill('10.0.0.1, 10.0.0.2');
  await page
    .getByRole('group', { name: 'Worker Tags' })
    .getByLabel('Key')
    .fill('type');
  await page
    .getByRole('group', { name: 'Worker Tags' })
    .getByLabel('Value')
    .fill('downstream');
  await page
    .getByRole('group', { name: 'Worker Tags' })
    .getByRole('button', { name: 'Add' })
    .click();

  // Register invalid worker token
  await page.getByLabel('Worker Auth Registration Request').fill('test');
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(
    page.getByRole('alert').getByText('Error', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();

  // Register worker token
  await page
    .getByLabel('Worker Auth Registration Request')
    .fill(process.env.E2E_WORKER_TOKEN);
  await page.getByRole('button', { name: 'Register' }).click();

  const text = await page.getByRole('alert').innerText();
  if (text.includes('Success')) {
    await page.getByRole('button', { name: 'Dismiss' }).click();
    await page.getByRole('button', { name: 'Done' }).click();
  } else if (text.includes('Error')) {
    await page.getByRole('button', { name: 'Dismiss' }).click();
  } else {
    throw new Error('Unexpected error');
  }
});
