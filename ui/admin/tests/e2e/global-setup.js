/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

/* eslint-disable no-undef */
const { chromium } = require('@playwright/test');
const { checkEnv, authenticatedState } = require('./helpers/general');

module.exports = async () => {
  await checkEnv([
    'BOUNDARY_ADDR',
    'E2E_PASSWORD_ADMIN_LOGIN_NAME',
    'E2E_PASSWORD_ADMIN_PASSWORD',
    'E2E_PASSWORD_AUTH_METHOD_ID',
  ]);

  // Log in and save the authenticated state to reuse in tests
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(process.env.BOUNDARY_ADDR);
  await page
    .getByLabel('Login Name')
    .fill(process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME);
  await page
    .getByLabel('Password')
    .fill(process.env.E2E_PASSWORD_ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('navigation', { name: 'General' }).waitFor();
  await page.getByText(process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME).waitFor();
  await page.context().storageState({ path: authenticatedState });
  await browser.close();
};
