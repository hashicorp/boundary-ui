/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { defineConfig, devices } from '@playwright/test';
import { authenticatedState, baseUrl } from '../global-setup';

/** @type {import('@playwright/test').PlaywrightTestConfig} */
export default defineConfig({
  globalSetup: '../global-setup',
  outputDir: './artifacts/test-failures',
  timeout: 90000, // Each test is given 90s to complete
  workers: 1, // Tests need to be run in serial, otherwise there may be conflicts when using the CLI
  reporter: [
    ['list'],
    process.env.CREATE_JUNIT_TEST_REPORT === 'true'
      ? ['junit', { outputFile: 'test-reports/junit.xml' }]
      : null,
  ].filter(Boolean),
  use: {
    baseURL: baseUrl,
    extraHTTPHeaders: {
      // This token is set in global-setup.js
      Authorization: `Bearer ${process.env.E2E_TOKEN}`,
    },
    screenshot: 'only-on-failure',
    storageState: authenticatedState,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
