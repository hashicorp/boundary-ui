/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

/* eslint-disable no-undef */

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  outputDir: './tests/e2e/artifacts',
  workers: 1, // Tests need to be run in serial, otherwise there may be conflicts when using the CLI
};

module.exports = config;
