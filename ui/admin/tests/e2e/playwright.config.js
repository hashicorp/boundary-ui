/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

/* eslint-disable no-undef */
const { devices } = require('@playwright/test');

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  globalSetup: require.resolve('./global-setup'),
  outputDir: './artifacts/test-failures',
  timeout: 45000, // Timeout is shared between all tests
  workers: 1, // Tests need to be run in serial, otherwise there may be conflicts when using the CLI
  use: {
    baseURL: process.env.BOUNDARY_ADDR,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
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
};

module.exports = config;
