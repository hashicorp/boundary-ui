/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */
import { defineConfig } from '@playwright/test';

/** @type {import('@playwright/test').PlaywrightTestConfig} */
export default defineConfig({
  outputDir: './artifacts',
  workers: 1, // Tests need to be run in serial, otherwise there may be conflicts when using the CLI
});
