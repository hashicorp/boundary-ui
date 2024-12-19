/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../../global-setup.js';
import { expect } from '@playwright/test';
import { execSync } from 'child_process';

import * as boundaryCli from '../../helpers/boundary-cli';
import * as vaultCli from '../../helpers/vault-cli';
import { AuthMethodsPage } from '../pages/auth-methods.js';
import { LoginPage } from '../pages/login.js';
import { OrgsPage } from '../pages/orgs.js';

const authPolicyName = 'auth-policy';

test.beforeAll(async () => {
  await boundaryCli.checkBoundaryCli();
  await vaultCli.checkVaultCli();
});

test.beforeEach(async () => {
  execSync(`vault auth disable userpass`);
});

test('Set up OIDC auth method @ce @ent @docker', async ({
  page,
  context,
  baseURL,
  adminAuthMethodId,
  adminLoginName,
  adminPassword,
  vaultAddr,
}) => {
  await page.goto('/');
  let orgName;
  try {
    // !! move this to helper method so that desktop client can use this
    // input username and password?
    const userName = 'end-user';
    const password = 'password123';
    execSync(`vault auth enable userpass`);
    execSync(
      `vault policy write ${authPolicyName} ./admin/tests/fixtures/auth-policy.hcl`,
    );
    execSync(
      `vault write auth/userpass/users/${userName} password=${password} token_policies=${authPolicyName} token_ttl=1h`,
    );
    execSync(
      `vault write identity/entity name=${userName} metadata=email=vault@hashicorp.com metadata=phone_number=123-456-7890 disabled=false`,
    );
    const entityId = execSync(
      `vault read -field=id identity/entity/name/${userName}`,
    )
      .toString()
      .trim();
    const groupName = 'engineering';
    execSync(
      `vault write identity/group name=${groupName} member_entity_ids=${entityId}`,
    );
    const groupId = execSync(
      `vault read -field=id identity/group/name/${groupName}`,
    )
      .toString()
      .trim();
    const authList = JSON.parse(
      execSync(`vault auth list -detailed -format json`),
    );
    const userpassAccessor = authList['userpass/'].accessor;
    execSync(
      `vault write identity/entity-alias name=${userName} canonical_id=${entityId} mount_accessor=${userpassAccessor}`,
    );
    const assignmentName = 'my-assignment';
    execSync(
      `vault write identity/oidc/assignment/${assignmentName} entity_ids=${entityId} group_ids=${groupId}`,
    );
    const keyName = 'my-key';
    execSync(
      `vault write identity/oidc/key/${keyName} allowed_client_ids=* verification_ttl=2h rotation_period=1h algorithm=RS256`,
    );
    const oidcClientName = 'boundary';
    execSync(
      `vault write identity/oidc/client/${oidcClientName}` +
        ` redirect_uris=${baseURL}/v1/auth-methods/oidc:authenticate:callback` +
        ` assignments=${assignmentName}` +
        ` key=${keyName}` +
        ` id_token_ttl=30m` +
        ` access_token_ttl=1h`,
    );
    const clientId = execSync(
      `vault read -field=client_id identity/oidc/client/${oidcClientName}`,
    )
      .toString()
      .trim();
    const userScopeTemplate = `
    {
      "username": {{identity.entity.name}},
      "contact": {
          "email": {{identity.entity.metadata.email}},
          "phone_number": {{identity.entity.metadata.phone_number}}
      }
    }`;
    const userScopeEncoded = Buffer.from(userScopeTemplate).toString('base64');
    execSync(
      `vault write identity/oidc/scope/user template=${userScopeEncoded}`,
    );
    const groupScopeTemplate = `
    {
      "groups": {{identity.entity.groups.names}}
    }`;
    const groupScopeEncoded =
      Buffer.from(groupScopeTemplate).toString('base64');
    execSync(
      `vault write identity/oidc/scope/groups template=${groupScopeEncoded}`,
    );

    const providerName = 'my-provider';
    execSync(
      `vault write identity/oidc/provider/${providerName} allowed_client_ids=${clientId} scopes_supported=groups,user issuer=${vaultAddr}`,
    );
    const oidcConfig = JSON.parse(
      execSync(
        `curl -s ${vaultAddr}/v1/identity/oidc/provider/${providerName}/.well-known/openid-configuration`,
      ),
    );
    const issuer = oidcConfig.issuer;
    const clientSecret = execSync(
      `vault read -field=client_secret identity/oidc/client/${oidcClientName}`,
    )
      .toString()
      .trim();

    // Log in
    const loginPage = new LoginPage(page);
    await loginPage.login(adminLoginName, adminPassword);
    await expect(
      page.getByRole('navigation', { name: 'breadcrumbs' }).getByText('Orgs'),
    ).toBeVisible();

    // Create OIDC Auth Method
    const orgsPage = new OrgsPage(page);
    orgName = await orgsPage.createOrg();
    const authMethodsPage = new AuthMethodsPage(page);
    const oidcAuthMethodName = await authMethodsPage.createOidcAuthMethod(
      issuer,
      clientId,
      clientSecret,
      baseURL,
    );

    // Change OIDC Auth Method state to active-public
    page.getByTitle('Inactive').click();
    page.getByText('Public').click();
    await expect(
      page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss' }).click();

    // Set auth method as primary
    await page.getByText('Manage', { exact: true }).click();
    await page.getByRole('button', { name: 'Make Primary' }).click();
    await page.getByRole('button', { name: 'OK' }).click();
    await expect(
      page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss' }).click();

    // Create an OIDC managed group
    await page
      .getByRole('navigation', { name: 'breadcrumbs' })
      .getByText(oidcAuthMethodName)
      .click();
    await page.getByText('Manage', { exact: true }).click();
    await page.getByRole('link', { name: 'Create Managed Group' }).click();
    const oidcManagedGroupName = 'OIDC Managed Group';
    await page.getByLabel('Name (Optional)').fill(oidcManagedGroupName);
    await page.getByLabel('Description').fill('This is an automated test');
    await page
      .getByLabel('Filter')
      .fill(`"hashicorp.com" in "/userinfo/email"`);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(
      page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss' }).click();

    // Log in using oidc account
    await loginPage.logout(adminLoginName);
    await page.getByText('Choose a different scope').click();
    await page.getByRole('link', { name: orgName }).click();
    await page.getByRole('link', { name: oidcAuthMethodName }).click();
    const pagePromise = context.waitForEvent('page');
    await page.getByRole('button', { name: 'Sign In' }).click();
    const vaultPage = await pagePromise;
    await vaultPage.getByLabel('Method').selectOption('Username');
    await vaultPage.getByLabel('Username').fill(userName);
    await vaultPage.getByLabel('Password').fill(password);
    await vaultPage.getByRole('button', { name: 'Sign In' }).click();
    await expect(
      page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText('Projects'),
    ).toBeVisible();

    // Log back in as an admin
    // await loginPage.logout(ldapUserName);
    // await loginPage.login(adminLoginName, adminPassword);
    // await expect(
    //   page.getByRole('navigation', { name: 'breadcrumbs' }).getByText('Orgs'),
    // ).toBeVisible();
  } finally {
    execSync(`vault auth disable userpass`);
    execSync(`vault policy delete ${authPolicyName}`);

    if (orgName) {
      await boundaryCli.authenticateBoundary(
        baseURL,
        adminAuthMethodId,
        adminLoginName,
        adminPassword,
      );
      const orgId = await boundaryCli.getOrgIdFromName(orgName);
      if (orgId) {
        await boundaryCli.deleteScope(orgId);
      }
    }
  }
});
