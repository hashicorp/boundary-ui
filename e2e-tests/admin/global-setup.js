/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { chromium } from '@playwright/test';
import { checkEnv } from '../helpers/general.js';

import { LoginPage } from './pages/login.js';

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

  const loginPage = new LoginPage(page);
  await loginPage.login(
    process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
    process.env.E2E_PASSWORD_ADMIN_PASSWORD,
  );
  const storageState = await page
    .context()
    .storageState({ path: authenticatedState });

  const state = JSON.parse(storageState.origins[0].localStorage[0].value);

  // Set the token in the environment for use in API requests
  process.env.E2E_TOKEN = state.authenticated.token;

  await browser.close();
}

export default globalSetup;

export const authenticatedState = './admin/artifacts/authenticated-state.json';
