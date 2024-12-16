/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test, authenticatedState } from '../../global-setup.js';
import { execSync } from 'node:child_process';

import * as boundaryCli from '../../helpers/boundary-cli';
import * as vaultCli from '../../helpers/vault-cli';
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
  await boundaryCli.checkBoundaryCli();
  await vaultCli.checkVaultCli();
});

test.beforeEach(
  async ({ baseURL, adminAuthMethodId, adminLoginName, adminPassword }) => {
    execSync(`vault policy delete ${secretPolicyName}`);
    execSync(`vault policy delete ${boundaryPolicyName}`);
    await boundaryCli.authenticateBoundaryCli(
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
    orgId = await boundaryCli.createOrgCli();
    let projectId = await boundaryCli.createProjectCli(orgId);

    // Create boundary resources using CLI
    let workerId = await boundaryCli.createControllerLedWorkerCli();
    let authMethodId = await boundaryCli.createPasswordAuthMethodCli(orgId);
    await boundaryCli.makeAuthMethodPrimaryCli(orgId, authMethodId);
    let passwordAccountId =
      await boundaryCli.reatePasswordAccountCli(authMethodId);
    let projectScopeRoleId = await boundaryCli.createRoleCli(projectId);
    let orgScopeRoleId = await boundaryCli.createRoleCli(orgId);
    let globalScopeRoleId = await boundaryCli.createRoleCli('global');
    let groupId = await boundaryCli.createGroupCli(orgId);
    let userId = await boundaryCli.createUserCli(orgId);
    let staticHostCatalogId =
      await boundaryCli.createStaticHostCatalogCli(projectId);
    let dynamicAwsHostCatalogId =
      await boundaryCli.createDynamicAwsHostCatalogCli(projectId, awsRegion);
    let staticHostId =
      await boundaryCli.createStaticHostCli(staticHostCatalogId);
    let staticHostSetId =
      await boundaryCli.createHostSetCli(staticHostCatalogId);
    let staticCredentialStoreId =
      await boundaryCli.createStaticCredentialStoreCli(projectId);
    const vaultToken = await vaultCli.getVaultToken(
      boundaryPolicyName,
      secretPolicyName,
    );
    let vaultCredentialStoreId =
      await boundaryCli.createVaultCredentialStoreCli(
        projectId,
        vaultAddr,
        vaultToken,
      );
    let usernamePasswordCredentialId =
      await boundaryCli.createUsernamePasswordCredentialCli(
        staticCredentialStoreId,
      );
    let tcpTargetId = await boundaryCli.createTcpTarget(projectId);

    // Create enterprise boundary resources using CLI
    let sshTargetId = await boundaryCli.createSshTargetCli(projectId);

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
      await boundaryCli.deleteScopeCli(orgId);
    }
  }
});
