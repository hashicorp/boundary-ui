/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { chromium, test as baseTest, mergeTests } from '@playwright/test';
import { checkEnv } from './helpers/general.js';
import { boundaryApiClientTest } from './helpers/boundary-api-client.js';
import { LoginPage } from './admin/pages/login.js';
import path from 'path';
import dotenv from 'dotenv';

const __dirname = import.meta.dirname;

// Import environment variables from .env file if available
dotenv.config({ path: path.resolve(__dirname, './.env') });

async function globalSetup() {
  await checkEnv([
    'BOUNDARY_ADDR',
    'E2E_PASSWORD_ADMIN_LOGIN_NAME',
    'E2E_PASSWORD_ADMIN_PASSWORD',
    'E2E_PASSWORD_AUTH_METHOD_ID',
  ]);
  await authenticateToBoundary();
}

const authenticateToBoundary = async () => {
  // Log in and save the authenticated state to reuse in tests
  const browser = await chromium.launch();
  const browserContext = await browser.newContext();
  const page = await browserContext.newPage();
  await page.goto(baseUrl);

  const loginPage = new LoginPage(page);
  await loginPage.login(
    process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
    process.env.E2E_PASSWORD_ADMIN_PASSWORD,
  );
  const storageState = await browserContext.storageState({
    path: authenticatedState,
  });

  const state = JSON.parse(storageState.origins[0].localStorage[0].value);

  // Set the token in the environment for use in API requests
  process.env.E2E_TOKEN = state.authenticated.token;

  await browserContext.close();
  await browser.close();
};

export default globalSetup;

export const baseUrl =
  process.env.BOUNDARY_ADDR_BRANCH ?? process.env.BOUNDARY_ADDR;

export const authenticatedState = path.resolve(
  __dirname,
  './.auth/authenticated-state.json',
);

// Centralized location for environment variables used in tests
export const base = baseTest.extend({
  adminAuthMethodId: process.env.E2E_PASSWORD_AUTH_METHOD_ID,
  adminLoginName: process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
  adminPassword: process.env.E2E_PASSWORD_ADMIN_PASSWORD,
  awsAccessKeyId: process.env.E2E_AWS_ACCESS_KEY_ID,
  awsBucketName: process.env.E2E_AWS_BUCKET_NAME,
  awsHostSetFilter: process.env.E2E_AWS_HOST_SET_FILTER,
  awsHostSetIps: process.env.E2E_AWS_HOST_SET_IPS,
  awsRegion: process.env.E2E_AWS_REGION,
  awsSecretAccessKey: process.env.E2E_AWS_SECRET_ACCESS_KEY,
  controllerAddr: process.env.BOUNDARY_ADDR,
  bucketAccessKeyId: process.env.E2E_BUCKET_ACCESS_KEY_ID,
  bucketEndpointUrl: process.env.E2E_BUCKET_ENDPOINT_URL,
  bucketName: process.env.E2E_BUCKET_NAME,
  bucketSecretAccessKey: process.env.E2E_BUCKET_SECRET_ACCESS_KEY,
  ldapAddr: process.env.E2E_LDAP_ADDR,
  ldapAdminDn: process.env.E2E_LDAP_ADMIN_DN,
  ldapAdminPassword: process.env.E2E_LDAP_ADMIN_PASSWORD,
  ldapDomainDn: process.env.E2E_LDAP_DOMAIN_DN,
  ldapGroupName: process.env.E2E_LDAP_GROUP_NAME,
  ldapUserName: process.env.E2E_LDAP_USER_NAME,
  ldapUserPassword: process.env.E2E_LDAP_USER_PASSWORD,
  region: process.env.E2E_REGION,
  sshCaKey: process.env.E2E_SSH_CA_KEY,
  sshCaKeyPublic: process.env.E2E_SSH_CA_KEY_PUBLIC,
  sshKeyPath: process.env.E2E_SSH_KEY_PATH,
  sshUser: process.env.E2E_SSH_USER,
  targetAddress: process.env.E2E_TARGET_ADDRESS,
  targetPort: process.env.E2E_TARGET_PORT,
  vaultAddr: process.env.E2E_VAULT_ADDR_PUBLIC,
  vaultAddrPrivate: process.env.E2E_VAULT_ADDR_PRIVATE,
  workerTagEgress: process.env.E2E_WORKER_TAG_EGRESS,
  request: async ({ playwright }, use) => {
    const request = await playwright.request.newContext({
      baseURL: process.env.BOUNDARY_ADDR,
    });
    await use(request);
  },
});

export const test = mergeTests(base, boundaryApiClientTest);
