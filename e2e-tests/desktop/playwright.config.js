/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */
import { defineConfig } from '@playwright/test';

/** @type {import('@playwright/test').PlaywrightTestConfig} */
export default defineConfig({
  globalSetup: '../global-setup',
  outputDir: './artifacts',
  workers: 1, // Tests need to be run in serial, otherwise there may be conflicts when using the CLI
  reporter: [
    ['list'],
    process.env.CREATE_JUNIT_TEST_REPORT === 'true'
      ? ['junit', { outputFile: 'test-reports/junit.xml' }]
      : null,
  ].filter(Boolean),
  use: {
    baseURL: process.env.BOUNDARY_ADDR,
    extraHTTPHeaders: {
      // This token is set in global-setup.js
      Authorization: `Bearer ${process.env.E2E_TOKEN}`,
    },
  },
  expect: {
    timeout: 10000,
  },
});
