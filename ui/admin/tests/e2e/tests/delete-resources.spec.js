/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

/* eslint-disable no-undef */
const { test } = require('@playwright/test');

const { authenticatedState, checkEnv } = require('../helpers/general');
const {
  authenticateBoundaryCli,
  checkBoundaryCli,
  createOrgCli,
  createProjectCli,
  createControllerLedWorkerCli,
  createPasswordAuthMethodCli,
  makeAuthMethodPrimaryCli,
  createPasswordAccountCli,
  createRoleCli,
  createGroupCli,
  createUserCli,
  createStaticHostCatalogCli,
  createDynamicAwsHostCatalogCli,
  createStaticHostCli,
  createHostSetCli,
  createStaticCredentialStoreCli,
  createTcpTarget,
  createVaultCredentialStoreCli,
  createUsernamePasswordCredentialCli,
  deleteOrgCli,
} = require('../helpers/boundary-cli');

const {
  deleteResource,
  removeAuthMethodAsPrimary,
} = require('../helpers/boundary-ui');
const { checkVaultCli } = require('../helpers/vault-cli');
const { execSync } = require('child_process');

const secretPolicyName = 'kv-policy';
const boundaryPolicyName = 'boundary-controller';

test.use({ storageState: authenticatedState });

test.beforeAll(async () => {
  await checkEnv([
    'VAULT_ADDR',
    'VAULT_TOKEN',
    'E2E_VAULT_ADDR',
    'E2E_TARGET_ADDRESS',
    'E2E_SSH_USER',
    'E2E_SSH_KEY_PATH',
    'E2E_AWS_ACCESS_KEY_ID',
    'E2E_AWS_SECRET_ACCESS_KEY',
  ]);
  await checkBoundaryCli();
  await checkVaultCli();
});

test.beforeEach(async () => {
  execSync(`vault policy delete ${secretPolicyName}`);
  execSync(`vault policy delete ${boundaryPolicyName}`);
  await authenticateBoundaryCli(
    process.env.BOUNDARY_ADDR,
    process.env.E2E_PASSWORD_AUTH_METHOD_ID,
    process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME,
    process.env.E2E_PASSWORD_ADMIN_PASSWORD,
    process.env.E2E_AWS_REGION,
  );
});

test('Verify resources can be deleted @ce @aws', async ({ page }) => {
  let orgId;
  let orgDeleted = false;
  try {
    // Create boundary resources using CLI
    orgId = await createOrgCli();
    let projectId = await createProjectCli(orgId);
    let workerId = await createControllerLedWorkerCli();
    let authMethodId = await createPasswordAuthMethodCli(orgId);
    await makeAuthMethodPrimaryCli(orgId, authMethodId);
    let passwordAccountId = await createPasswordAccountCli(authMethodId);
    let projectScopeRoleId = await createRoleCli(projectId);
    let orgScopeRoleId = await createRoleCli(orgId);
    let globalScopeRoleId = await createRoleCli('global');
    let groupId = await createGroupCli(orgId);
    let userId = await createUserCli(orgId);
    let staticHostCatalogId = await createStaticHostCatalogCli(projectId);
    let dynamicAwsHostCatalogId = await createDynamicAwsHostCatalogCli(
      projectId,
      process.env.E2E_AWS_REGION,
    );
    let staticHostId = await createStaticHostCli(staticHostCatalogId);
    let staticHostSetId = await createHostSetCli(staticHostCatalogId);
    let staticCredentialStoreId =
      await createStaticCredentialStoreCli(projectId);
    let vaultCredentialStoreId = await createVaultCredentialStoreCli(
      projectId,
      process.env.E2E_VAULT_ADDR,
      secretPolicyName,
      boundaryPolicyName,
    );
    let usernamePasswordCredentialId =
      await createUsernamePasswordCredentialCli(staticCredentialStoreId);
    let tcpTargetId = await createTcpTarget(projectId);

    // Delete TCP target
    await page.goto(`/scopes/${projectId}/targets/${tcpTargetId}`);
    await deleteResource(page);

    // Delete username-password credentials
    await page.goto(
      `/scopes/${projectId}/credential-stores/${staticCredentialStoreId}/credentials/${usernamePasswordCredentialId}`,
    );
    await deleteResource(page);

    // Delete static credential store
    await page.goto(
      `/scopes/${projectId}/credential-stores/${staticCredentialStoreId}`,
    );
    await deleteResource(page);

    // Delete vault credential store
    await page.goto(
      `/scopes/${projectId}/credential-stores/${vaultCredentialStoreId}`,
    );
    await deleteResource(page);

    // Delete static host set
    await page.goto(
      `/scopes/${projectId}/host-catalogs/${staticHostCatalogId}/host-sets/${staticHostSetId}`,
    );
    await deleteResource(page);

    // Delete static host
    await page.goto(
      `/scopes/${projectId}/host-catalogs/${staticHostCatalogId}/hosts/${staticHostId}`,
    );
    await deleteResource(page);

    // Delete static host catalog
    await page.goto(
      `/scopes/${projectId}/host-catalogs/${staticHostCatalogId}`,
    );
    await deleteResource(page);

    // Delete dynamic aws host catalog
    await page.goto(
      `/scopes/${projectId}/host-catalogs/${dynamicAwsHostCatalogId}`,
    );
    await deleteResource(page);

    // Delete user
    await page.goto(`/scopes/${projectId}/users/${userId}`);
    await deleteResource(page);

    // Delete group
    await page.goto(`/scopes/${projectId}/groups/${groupId}`);
    await deleteResource(page);

    // Delete role under global scope
    await page.goto(`/scopes/global/roles/${globalScopeRoleId}`);
    await deleteResource(page);

    // Delete role under org scope
    await page.goto(`/scopes/${projectId}/roles/${orgScopeRoleId}`);
    await deleteResource(page);

    // Delete role under project scope
    await page.goto(`/scopes/${projectId}/roles/${projectScopeRoleId}`);
    await deleteResource(page);

    // Delete password account
    await page.goto(
      `/scopes/${orgId}/auth-methods/${authMethodId}/accounts/${passwordAccountId}`,
    );
    await deleteResource(page);

    // Delete auth method
    await page.goto(`/scopes/${orgId}/auth-methods/${authMethodId}`);
    await removeAuthMethodAsPrimary(page);
    await deleteResource(page);

    // Delete worker
    await page.goto(`/scopes/global/workers/${workerId}`);
    await deleteResource(page);

    // Delete project
    await page.goto(`/scopes/${projectId}`);
    await deleteResource(page);

    // Delete org
    await page.goto(`/scopes/${orgId}/edit`);
    await deleteResource(page);
    orgDeleted = true;
  } finally {
    // Delete org in case the test failed before deleting the org using UI
    if (orgId && orgDeleted === false) {
      await deleteOrgCli(orgId);
    }
  }
});
