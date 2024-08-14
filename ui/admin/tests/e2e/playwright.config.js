/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { defineConfig, devices } from '@playwright/test';

/** @type {import('@playwright/test').PlaywrightTestConfig} */
export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  outputDir: './artifacts/test-failures',
  timeout: 90000, // Each test is given 90s to complete
  workers: 1, // Tests need to be run in serial, otherwise there may be conflicts when using the CLI
  use: {
    baseURL: process.env.BOUNDARY_ADDR,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    extraHTTPHeaders: {
      // This token is set in global-setup.js
      Authorization: `Bearer ${process.env.E2E_TOKEN}`,
    },
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
