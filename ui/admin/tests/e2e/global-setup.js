/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { chromium } from '@playwright/test';
import { checkEnv, authenticatedState } from './helpers/general';

async function globalSetup() {
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
    .getByLabel('Password', { exact: true })
    .fill(process.env.E2E_PASSWORD_ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('navigation', { name: 'General' }).waitFor();
  await page.getByText(process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME).waitFor();
  const storageState = await page
    .context()
    .storageState({ path: authenticatedState });

  const state = JSON.parse(storageState.origins[0].localStorage[0].value);

  // Set the token in the environment for use in API requests
  process.env.E2E_TOKEN = state.authenticated.token;

  await browser.close();
}

export default globalSetup;
