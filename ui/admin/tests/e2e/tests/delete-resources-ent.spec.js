/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

const { test } = require('@playwright/test');
const { execSync } = require('child_process');

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
  createSshTargetCli,
  createVaultCredentialStoreCli,
  createUsernamePasswordCredentialCli,
  deleteOrgCli,
} = require('../helpers/boundary-cli');
const { checkVaultCli } = require('../helpers/vault-cli');
const AuthMethodsPage = require('../pages/auth-methods');
const BaseResourcePage = require('../pages/base-resource');
const WorkersPage = require('../pages/workers');

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

test('Verify resources can be deleted (enterprise) @ent @aws', async ({
  page,
}) => {
  let orgId;
  let orgDeleted = false;
  try {
    orgId = await createOrgCli();
    let projectId = await createProjectCli(orgId);

    // Create boundary resources using CLI
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

    // Create enterprise boundary resources using CLI
    let sshTargetId = await createSshTargetCli(projectId);

    // Delete resources
    const baseResourcePage = new BaseResourcePage(page);

    await page.goto(`/scopes/${projectId}/targets/${tcpTargetId}`);
    await baseResourcePage.deleteResource(page);
    await page.goto(
      `/scopes/${projectId}/credential-stores/${staticCredentialStoreId}/credentials/${usernamePasswordCredentialId}`,
    );
    await baseResourcePage.deleteResource(page);
    await page.goto(
      `/scopes/${projectId}/credential-stores/${staticCredentialStoreId}`,
    );
    await baseResourcePage.deleteResource(page);
    await page.goto(
      `/scopes/${projectId}/credential-stores/${vaultCredentialStoreId}`,
    );
    await baseResourcePage.deleteResource(page);
    await page.goto(
      `/scopes/${projectId}/host-catalogs/${staticHostCatalogId}/host-sets/${staticHostSetId}`,
    );
    await baseResourcePage.deleteResource(page);
    await page.goto(
      `/scopes/${projectId}/host-catalogs/${staticHostCatalogId}/hosts/${staticHostId}`,
    );
    await baseResourcePage.deleteResource(page);
    await page.goto(
      `/scopes/${projectId}/host-catalogs/${staticHostCatalogId}`,
    );
    await baseResourcePage.deleteResource(page);
    await page.goto(
      `/scopes/${projectId}/host-catalogs/${dynamicAwsHostCatalogId}`,
    );
    await baseResourcePage.deleteResource(page);
    await page.goto(`/scopes/${projectId}/users/${userId}`);
    await baseResourcePage.deleteResource(page);
    await page.goto(`/scopes/${projectId}/groups/${groupId}`);
    await baseResourcePage.deleteResource(page);
    await page.goto(`/scopes/global/roles/${globalScopeRoleId}`);
    await baseResourcePage.deleteResource(page);
    await page.goto(`/scopes/${projectId}/roles/${orgScopeRoleId}`);
    await baseResourcePage.deleteResource(page);
    await page.goto(`/scopes/${projectId}/roles/${projectScopeRoleId}`);
    await baseResourcePage.deleteResource(page);
    await page.goto(
      `/scopes/${orgId}/auth-methods/${authMethodId}/accounts/${passwordAccountId}`,
    );
    await baseResourcePage.deleteResource(page);
    await page.goto(`/scopes/${orgId}/auth-methods/${authMethodId}`);
    const authMethodsPage = new AuthMethodsPage(page);
    await authMethodsPage.removeAuthMethodAsPrimary();
    await baseResourcePage.deleteResource(page);
    await page.goto(`/scopes/global/workers/${workerId}`);
    const workersPage = new WorkersPage(page);
    await workersPage.deleteResource(page);

    // Delete enterprise resources
    await page.goto(`/scopes/${projectId}/targets/${sshTargetId}`);
    await baseResourcePage.deleteResource(page);

    // Delete project and org
    await page.goto(`/scopes/${projectId}`);
    await baseResourcePage.deleteResource(page);
    await page.goto(`/scopes/${orgId}/edit`);
    await baseResourcePage.deleteResource(page);
    orgDeleted = true;
  } finally {
    if (orgId && orgDeleted == false) {
      await deleteOrgCli(orgId);
    }
  }
});
