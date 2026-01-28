/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../../global-setup.js';
import { expect } from '@playwright/test';

test(
  'Create a worker (enterprise)',
  { tag: ['@ent', '@aws', '@docker'] },
  async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Bug in worker form on Safari');

    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Application local navigation' })
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
      .fill('downstream, pki');
    await page
      .getByRole('group', { name: 'Worker Tags' })
      .getByRole('button', { name: 'Add' })
      .click();
    await page
      .getByRole('group', { name: 'Worker Tags' })
      .getByLabel('Key')
      .last()
      .fill('test');
    await page
      .getByRole('group', { name: 'Worker Tags' })
      .getByLabel('Value')
      .last()
      .fill('example');
    await page
      .getByRole('group', { name: 'Worker Tags' })
      .getByRole('button', { name: 'Add' })
      .click();

    await page
      .getByRole('switch', { name: 'Enable Recording Storage' })
      .click();
    await page.getByLabel('Recording Storage Path').fill('/tmp/recordings');

    // Check auto-populated config
    const dirLocator = '[data-test-worker-directory]';
    await expect(page.locator(dirLocator)).toContainText(
      'mkdir /home/ubuntu/boundary/ ;',
    );
    await expect(page.locator(dirLocator)).toContainText(
      'touch /home/ubuntu/boundary/pki-worker.hcl',
    );

    const configLocator = '[data-test-worker-config]';
    await expect(page.locator(configLocator)).toContainText(
      'public_addr = "worker1.example.com"',
    );
    await expect(page.locator(configLocator)).toContainText(
      'auth_storage_path = "/home/ubuntu/boundary/worker1"',
    );
    await expect(page.locator(configLocator)).toContainText(
      'initial_upstreams = ["10.0.0.1", "10.0.0.2"]',
    );
    await expect(page.locator(configLocator)).toContainText(
      'type = ["downstream", "pki"]',
    );
    await expect(page.locator(configLocator)).toContainText(
      'test = ["example"]',
    );
    await expect(page.locator(configLocator)).toContainText(
      'recording_storage_path = "/tmp/recordings"',
    );

    // Try using an invalid worker token. Expect an error
    await page.getByLabel('Worker Auth Registration Request').fill('test');
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(
      page.getByRole('alert').getByText('Error', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss' }).click();
  },
);
