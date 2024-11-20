/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { defineConfig, devices, test as baseTest } from '@playwright/test';

/** @type {import('@playwright/test').PlaywrightTestConfig} */
export default defineConfig({
  globalSetup: './global-setup',
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

export const test = baseTest.extend({
  adminAuthMethodId: process.env.E2E_PASSWORD_AUTH_METHOD_ID,
  adminLoginName: process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
  adminPassword: process.env.E2E_PASSWORD_ADMIN_PASSWORD,
  awsAccessKeyId: process.env.E2E_AWS_ACCESS_KEY_ID,
  awsBucketName: process.env.E2E_AWS_BUCKET_NAME,
  awsHostSetFilter: process.env.E2E_AWS_HOST_SET_FILTER,
  awsHostSetIps: process.env.E2E_AWS_HOST_SET_IPS,
  awsRegion: process.env.E2E_AWS_REGION,
  awsSecretAccessKey: process.env.E2E_AWS_SECRET_ACCESS_KEY,
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
  vaultAddr: process.env.E2E_VAULT_ADDR,
  workerTagEgress: process.env.E2E_WORKER_TAG_EGRESS,
});
