/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

/* eslint-disable no-undef */
const { test } = require('@playwright/test');

const { authenticatedState, checkEnv } = require('../helpers/general');
const {
  authenticateBoundaryCli,
  checkBoundaryCli,
  createNewOrgCli,
  createNewProjectCli,
  createNewControllerLedWorkerCli,
  createNewPasswordAuthMethodCli,
  makeAuthMethodPrimaryCli,
  createNewPasswordAccountCli,
  createNewRoleCli,
  createNewGroupCli,
  createNewUserCli,
  createNewStaticHostCatalogCli,
  createDynamicAwsHostCatalogCli,
  createNewStaticHostCli,
  createNewHostSetCli,
  createNewStaticCredentialStoreCli,
  createNewTcpTarget,
  createNewSshTargetCli,
  createNewVaultCredentialStoreCli,
  createNewUsernamePasswordCredentialCli,
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
  await authenticateBoundaryCli();
});

test('Verify resources can be deleted (enterprise) @ent @aws', async ({
  page,
}) => {
  let orgId;
  try {
    orgId = await createNewOrgCli();
    let projectId = await createNewProjectCli(orgId);

    // Create boundary resources using CLI
    let workerId = await createNewControllerLedWorkerCli();
    let authMethodId = await createNewPasswordAuthMethodCli(orgId);
    await makeAuthMethodPrimaryCli(orgId, authMethodId);
    let passwordAccountId = await createNewPasswordAccountCli(authMethodId);
    let projectScopeRoleId = await createNewRoleCli(projectId);
    let orgScopeRoleId = await createNewRoleCli(orgId);
    let globalScopeRoleId = await createNewRoleCli('global');
    let groupId = await createNewGroupCli(orgId);
    let userId = await createNewUserCli(orgId);
    let staticHostCatalogId = await createNewStaticHostCatalogCli(projectId);
    let dynamicAwsHostCatalogId =
      await createDynamicAwsHostCatalogCli(projectId);
    let staticHostId = await createNewStaticHostCli(staticHostCatalogId);
    let staticHostSetId = await createNewHostSetCli(staticHostCatalogId);
    let staticCredentialStoreId =
      await createNewStaticCredentialStoreCli(projectId);
    let vaultCredentialStoreId = await createNewVaultCredentialStoreCli(
      projectId,
      secretPolicyName,
      boundaryPolicyName,
    );
    let usernamePasswordCredentialId =
      await createNewUsernamePasswordCredentialCli(staticCredentialStoreId);
    let tcpTargetId = await createNewTcpTarget(projectId);

    // Create enterprise boundary resources using CLI
    let sshTargetId = await createNewSshTargetCli(projectId);

    // Delete resources
    await page.goto(`/scopes/${projectId}/targets/${tcpTargetId}`);
    await deleteResource(page);
    await page.goto(
      `/scopes/${projectId}/credential-stores/${staticCredentialStoreId}/credentials/${usernamePasswordCredentialId}`,
    );
    await deleteResource(page);
    await page.goto(
      `/scopes/${projectId}/credential-stores/${staticCredentialStoreId}`,
    );
    await deleteResource(page);
    await page.goto(
      `/scopes/${projectId}/credential-stores/${vaultCredentialStoreId}`,
    );
    await deleteResource(page);
    await page.goto(
      `/scopes/${projectId}/host-catalogs/${staticHostCatalogId}/host-sets/${staticHostSetId}`,
    );
    await deleteResource(page);
    await page.goto(
      `/scopes/${projectId}/host-catalogs/${staticHostCatalogId}/hosts/${staticHostId}`,
    );
    await deleteResource(page);
    await page.goto(
      `/scopes/${projectId}/host-catalogs/${staticHostCatalogId}`,
    );
    await deleteResource(page);
    await page.goto(
      `/scopes/${projectId}/host-catalogs/${dynamicAwsHostCatalogId}`,
    );
    await deleteResource(page);
    await page.goto(`/scopes/${projectId}/users/${userId}`);
    await deleteResource(page);
    await page.goto(`/scopes/${projectId}/groups/${groupId}`);
    await deleteResource(page);
    await page.goto(`/scopes/global/roles/${globalScopeRoleId}`);
    await deleteResource(page);
    await page.goto(`/scopes/${projectId}/roles/${orgScopeRoleId}`);
    await deleteResource(page);
    await page.goto(`/scopes/${projectId}/roles/${projectScopeRoleId}`);
    await deleteResource(page);
    await page.goto(
      `/scopes/${orgId}/auth-methods/${authMethodId}/accounts/${passwordAccountId}`,
    );
    await deleteResource(page);
    await page.goto(`/scopes/${orgId}/auth-methods/${authMethodId}`);
    await removeAuthMethodAsPrimary(page);
    await deleteResource(page);
    await page.goto(`/scopes/global/workers/${workerId}`);
    await deleteResource(page);

    // Delete enterprise resources
    await page.goto(`/scopes/${projectId}/targets/${sshTargetId}`);
    await deleteResource(page);

    // Delete project and org
    await page.goto(`/scopes/${projectId}`);
    await deleteResource(page);
    await page.goto(`/scopes/${orgId}/edit`);
    await deleteResource(page);
  } finally {
    await deleteOrgCli(orgId);
  }
});