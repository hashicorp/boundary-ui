/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../playwright.config.js';
import { execSync } from 'node:child_process';

import { authenticatedState } from '../global-setup.js';
import {
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
  deleteScopeCli,
} from '../../helpers/boundary-cli.js';
import { checkVaultCli, getVaultToken } from '../../helpers/vault-cli.js';
import { AuthMethodsPage } from '../pages/auth-methods.js';
import { BaseResourcePage } from '../pages/base-resource.js';
import { WorkersPage } from '../pages/workers.js';

const secretPolicyName = 'kv-policy';
const boundaryPolicyName = 'boundary-controller';

test.use({ storageState: authenticatedState });

// Setting the test timeout to 120s
// This test can often exceed the globally defined timeout due to the number of
// network calls.
test.setTimeout(180000);

test.beforeAll(async () => {
  await checkBoundaryCli();
  await checkVaultCli();
});

test.beforeEach(
  async ({ baseURL, adminAuthMethodId, adminLoginName, adminPassword }) => {
    execSync(`vault policy delete ${secretPolicyName}`);
    execSync(`vault policy delete ${boundaryPolicyName}`);
    await authenticateBoundaryCli(
      baseURL,
      adminAuthMethodId,
      adminLoginName,
      adminPassword,
    );
  },
);

test('Verify resources can be deleted (enterprise) @ent @aws', async ({
  page,
  awsRegion,
  vaultAddr,
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
      awsRegion,
    );
    let staticHostId = await createStaticHostCli(staticHostCatalogId);
    let staticHostSetId = await createHostSetCli(staticHostCatalogId);
    let staticCredentialStoreId =
      await createStaticCredentialStoreCli(projectId);
    const vaultToken = await getVaultToken(
      boundaryPolicyName,
      secretPolicyName,
    );
    let vaultCredentialStoreId = await createVaultCredentialStoreCli(
      projectId,
      vaultAddr,
      vaultToken,
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
      await deleteScopeCli(orgId);
    }
  }
});
