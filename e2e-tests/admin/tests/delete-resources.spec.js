/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../../global-setup.js';
import { execSync } from 'node:child_process';

import * as boundaryCli from '../../helpers/boundary-cli';
import * as vaultCli from '../../helpers/vault-cli';
import { AuthMethodsPage } from '../pages/auth-methods.js';
import { BaseResourcePage } from '../pages/base-resource.js';
import { WorkersPage } from '../pages/workers.js';

const secretPolicyName = 'kv-policy';
const boundaryPolicyName = 'boundary-controller';

// Setting the test timeout to 180s
// This test can often exceed the globally defined timeout due to the number of
// network calls.
test.setTimeout(180000);

test.beforeAll(async () => {
  await boundaryCli.checkBoundaryCli();
  await vaultCli.checkVaultCli();
});

test.beforeEach(
  async ({
    controllerAddr,
    adminAuthMethodId,
    adminLoginName,
    adminPassword,
  }) => {
    await boundaryCli.authenticateBoundary(
      controllerAddr,
      adminAuthMethodId,
      adminLoginName,
      adminPassword,
    );
  },
);

test.afterEach(() => {
  execSync(`vault policy delete ${secretPolicyName}`);
  execSync(`vault policy delete ${boundaryPolicyName}`);
});

test(
  'Verify resources can be deleted',
  { tag: ['@ce', '@aws'] },
  async ({ page, awsRegion, vaultAddr }) => {
    let orgId;
    let orgDeleted = false;
    try {
      // Create boundary resources using CLI
      orgId = await boundaryCli.createOrg();
      let projectId = await boundaryCli.createProject(orgId);
      let workerId = await boundaryCli.createControllerLedWorker();
      let authMethodId = await boundaryCli.createPasswordAuthMethod(orgId);
      await boundaryCli.makeAuthMethodPrimary(orgId, authMethodId);
      let passwordAccountId =
        await boundaryCli.createPasswordAccount(authMethodId);
      let projectScopeRoleId = await boundaryCli.createRole(projectId, {});
      let orgScopeRoleId = await boundaryCli.createRole(orgId, {});
      let globalScopeRoleId = await boundaryCli.createRole('global', {});
      let groupId = await boundaryCli.createGroup(orgId);
      let userId = await boundaryCli.createUser(orgId);
      let staticHostCatalogId =
        await boundaryCli.createStaticHostCatalog(projectId);
      let dynamicAwsHostCatalogId =
        await boundaryCli.createDynamicAwsHostCatalog(projectId, awsRegion);
      let staticHostId =
        await boundaryCli.createStaticHost(staticHostCatalogId);
      let staticHostSetId =
        await boundaryCli.createHostSet(staticHostCatalogId);
      let staticCredentialStoreId =
        await boundaryCli.createStaticCredentialStore(projectId);
      const vaultToken = await vaultCli.getVaultToken(
        boundaryPolicyName,
        secretPolicyName,
      );
      let vaultCredentialStoreId = await boundaryCli.createVaultCredentialStore(
        projectId,
        vaultAddr,
        vaultToken,
      );
      let usernamePasswordCredentialId =
        await boundaryCli.createUsernamePasswordCredential(
          staticCredentialStoreId,
        );
      let tcpTargetId = await boundaryCli.createTcpTarget(projectId);

      const baseResourcePage = new BaseResourcePage(page);

      // Delete TCP target
      await page.goto(`/scopes/${projectId}/targets/${tcpTargetId}`);
      await baseResourcePage.deleteResource(page);

      // Delete username-password credentials
      await page.goto(
        `/scopes/${projectId}/credential-stores/${staticCredentialStoreId}/credentials/${usernamePasswordCredentialId}`,
      );
      await baseResourcePage.deleteResource(page);

      // Delete static credential store
      await page.goto(
        `/scopes/${projectId}/credential-stores/${staticCredentialStoreId}`,
      );
      await baseResourcePage.deleteResource(page);

      // Delete vault credential store
      await page.goto(
        `/scopes/${projectId}/credential-stores/${vaultCredentialStoreId}`,
      );
      await baseResourcePage.deleteResource(page);

      // Delete static host set
      await page.goto(
        `/scopes/${projectId}/host-catalogs/${staticHostCatalogId}/host-sets/${staticHostSetId}`,
      );
      await baseResourcePage.deleteResource(page);

      // Delete static host
      await page.goto(
        `/scopes/${projectId}/host-catalogs/${staticHostCatalogId}/hosts/${staticHostId}`,
      );
      await baseResourcePage.deleteResource(page);

      // Delete static host catalog
      await page.goto(
        `/scopes/${projectId}/host-catalogs/${staticHostCatalogId}`,
      );
      await baseResourcePage.deleteResource(page);

      // Delete dynamic aws host catalog
      await page.goto(
        `/scopes/${projectId}/host-catalogs/${dynamicAwsHostCatalogId}`,
      );
      await baseResourcePage.deleteResource(page);

      // Delete user
      await page.goto(`/scopes/${projectId}/users/${userId}`);
      await baseResourcePage.deleteResource(page);

      // Delete group
      await page.goto(`/scopes/${projectId}/groups/${groupId}`);
      await baseResourcePage.deleteResource(page);

      // Delete role under global scope
      await page.goto(`/scopes/global/roles/${globalScopeRoleId}`);
      await baseResourcePage.deleteResource(page);

      // Delete role under org scope
      await page.goto(`/scopes/${projectId}/roles/${orgScopeRoleId}`);
      await baseResourcePage.deleteResource(page);

      // Delete role under project scope
      await page.goto(`/scopes/${projectId}/roles/${projectScopeRoleId}`);
      await baseResourcePage.deleteResource(page);

      // Delete password account
      await page.goto(
        `/scopes/${orgId}/auth-methods/${authMethodId}/accounts/${passwordAccountId}`,
      );
      await baseResourcePage.deleteResource(page);

      // Delete auth method
      await page.goto(`/scopes/${orgId}/auth-methods/${authMethodId}`);
      const authMethodsPage = new AuthMethodsPage(page);
      await authMethodsPage.removeAuthMethodAsPrimary();
      await baseResourcePage.deleteResource(page);

      // Delete worker
      await page.goto(`/scopes/global/workers/${workerId}`);
      const workersPage = new WorkersPage(page);
      await workersPage.deleteResource(page);

      // Delete project
      await page.goto(`/scopes/${projectId}/edit`);
      await baseResourcePage.deleteResource(page);

      // Delete org
      await page.goto(`/scopes/${orgId}/edit`);
      await baseResourcePage.deleteResource(page);
      orgDeleted = true;
    } finally {
      // Delete org in case the test failed before deleting the org using UI
      if (orgId && orgDeleted === false) {
        await boundaryCli.deleteScope(orgId);
      }
    }
  },
);
