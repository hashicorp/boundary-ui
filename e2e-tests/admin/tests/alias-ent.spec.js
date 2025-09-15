/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../../global-setup.js';
import { expect } from '@playwright/test';
import { customAlphabet } from 'nanoid';

import * as boundaryCli from '../../helpers/boundary-cli';
import { AliasesPage } from '../pages/aliases.js';
import { CredentialStoresPage } from '../pages/credential-stores.js';
import { OrgsPage } from '../pages/orgs.js';
import { ProjectsPage } from '../pages/projects.js';
import { SessionsPage } from '../pages/sessions.js';
import { TargetsPage } from '../pages/targets.js';

test.beforeAll(async () => {
  await boundaryCli.checkBoundaryCli();
});

test.describe('Aliases (Enterprise)', () => {
  test(
    'Set up alias from target details page',
    { tag: ['@ent', '@aws', '@docker'] },
    async ({
      page,
      controllerAddr,
      adminAuthMethodId,
      adminLoginName,
      adminPassword,
      sshUser,
      sshKeyPath,
      targetAddress,
      targetPort,
    }) => {
      await page.goto('/');
      let orgName;
      let alias;
      let connect;
      const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);
      try {
        const orgsPage = new OrgsPage(page);
        orgName = await orgsPage.createOrg();
        const projectsPage = new ProjectsPage(page);
        await projectsPage.createProject();

        const targetsPage = new TargetsPage(page);
        const targetName = await targetsPage.createTargetWithAddressEnt(
          'ssh',
          targetAddress,
          targetPort,
        );
        const credentialStoresPage = new CredentialStoresPage(page);
        await credentialStoresPage.createStaticCredentialStore();
        const credentialName =
          await credentialStoresPage.createStaticCredentialKeyPair(
            sshUser,
            sshKeyPath,
          );
        await targetsPage.addInjectedCredentialsToTarget(
          targetName,
          credentialName,
        );

        // Create alias for target
        await page
          .getByRole('navigation', { name: 'breadcrumbs' })
          .getByText(targetName)
          .click();
        const aliasName = 'Alias ' + nanoid();
        alias = 'example.alias.' + nanoid();
        await page.getByRole('link', { name: 'Add an alias' }).click();
        await page.getByLabel('Name').fill(aliasName);
        await page.getByLabel('Description').fill('This is an automated test');
        await page.getByLabel('Alias Value').fill(alias);
        await page.getByRole('button', { name: 'Save' }).click();
        await expect(
          page.getByRole('alert').getByText('Success', { exact: true }),
        ).toBeVisible();
        await page.getByRole('button', { name: 'Dismiss' }).click();

        // Connect to target using alias
        await boundaryCli.authenticateBoundary(
          controllerAddr,
          adminAuthMethodId,
          adminLoginName,
          adminPassword,
        );
        connect = await boundaryCli.connectSshToAlias(alias);
        const sessionsPage = new SessionsPage(page);
        await sessionsPage.waitForSessionToBeVisible(targetName);

        // Clear destination from alias
        await page
          .getByRole('navigation', { name: 'Application local navigation' })
          .getByRole('link', { name: 'Targets' })
          .click();
        await page.getByRole('link', { name: targetName }).click();
        await page.getByRole('link', { name: alias }).click();
        // Note: On the Target details page, there is a section with the header
        // "Aliases". The extra check here is to ensure that we are on the Alias
        // details page and not the Target details page.
        await expect(
          page.getByRole('heading', { name: 'Alias' }),
        ).not.toHaveText('Aliases');
        await page.getByRole('button', { name: 'Manage' }).click();
        await page.getByText('Clear', { exact: true }).click();
        await page.getByText('OK', { exact: true }).click();
        await expect(
          page.getByRole('alert').getByText('Success', { exact: true }),
        ).toBeVisible();
        await page.getByRole('button', { name: 'Dismiss' }).click();
      } finally {
        if (connect) {
          connect.kill('SIGTERM');
        }
        await boundaryCli.authenticateBoundary(
          controllerAddr,
          adminAuthMethodId,
          adminLoginName,
          adminPassword,
        );
        if (orgName) {
          const orgId = await boundaryCli.getOrgIdFromName(orgName);
          if (orgId) {
            await boundaryCli.deleteScope(orgId);
          }
        }
        if (alias) {
          await boundaryCli.deleteAlias(alias);
        }
      }
    },
  );

  test(
    'Set up alias from new target page',
    { tag: ['@ent', '@aws', '@docker'] },
    async ({
      page,
      controllerAddr,
      adminAuthMethodId,
      adminLoginName,
      adminPassword,
      sshUser,
      sshKeyPath,
      targetAddress,
      targetPort,
    }) => {
      await page.goto('/');
      let orgName;
      let alias;
      let connect;
      const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);
      try {
        const orgsPage = new OrgsPage(page);
        orgName = await orgsPage.createOrg();
        await boundaryCli.authenticateBoundary(
          controllerAddr,
          adminAuthMethodId,
          adminLoginName,
          adminPassword,
        );
        const projectsPage = new ProjectsPage(page);
        await projectsPage.createProject();
        alias = 'example.alias.' + nanoid();
        const targetsPage = new TargetsPage(page);
        const targetName = await targetsPage.createTargetWithAddressAndAliasEnt(
          'ssh',
          targetAddress,
          targetPort,
          alias,
        );
        const credentialStoresPage = new CredentialStoresPage(page);
        await credentialStoresPage.createStaticCredentialStore();
        const credentialName =
          await credentialStoresPage.createStaticCredentialKeyPair(
            sshUser,
            sshKeyPath,
          );
        await targetsPage.addInjectedCredentialsToTarget(
          targetName,
          credentialName,
        );

        // Connect to target using alias
        connect = await boundaryCli.connectSshToAlias(alias);
        const sessionsPage = new SessionsPage(page);
        await sessionsPage.waitForSessionToBeVisible(targetName);
      } finally {
        if (connect) {
          connect.kill('SIGTERM');
        }
        await boundaryCli.authenticateBoundary(
          controllerAddr,
          adminAuthMethodId,
          adminLoginName,
          adminPassword,
        );

        if (orgName) {
          const orgId = await boundaryCli.getOrgIdFromName(orgName);
          if (orgId) {
            await boundaryCli.deleteScope(orgId);
          }
          if (alias) {
            await boundaryCli.deleteAlias(alias);
          }
        }
      }
    },
  );

  test(
    'Set up alias from aliases page',
    { tag: ['@ent', '@aws', '@docker'] },
    async ({
      page,
      controllerAddr,
      adminAuthMethodId,
      adminLoginName,
      adminPassword,
      sshUser,
      sshKeyPath,
      targetAddress,
      targetPort,
    }) => {
      await page.goto('/');
      const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);
      let orgId;
      let alias;
      let connect;
      try {
        const orgsPage = new OrgsPage(page);
        const orgName = await orgsPage.createOrg();
        const projectsPage = new ProjectsPage(page);
        const projectName = await projectsPage.createProject();
        const targetsPage = new TargetsPage(page);
        const targetName = await targetsPage.createTargetWithAddressEnt(
          'ssh',
          targetAddress,
          targetPort,
        );
        const credentialStoresPage = new CredentialStoresPage(page);
        await credentialStoresPage.createStaticCredentialStore();
        const credentialName =
          await credentialStoresPage.createStaticCredentialKeyPair(
            sshUser,
            sshKeyPath,
          );
        await targetsPage.addInjectedCredentialsToTarget(
          targetName,
          credentialName,
        );

        // Create new alias from scope page
        await boundaryCli.authenticateBoundary(
          controllerAddr,
          adminAuthMethodId,
          adminLoginName,
          adminPassword,
        );
        orgId = await boundaryCli.getOrgIdFromName(orgName);
        const projectId = await boundaryCli.getProjectIdFromName(
          orgId,
          projectName,
        );
        const targetId = await boundaryCli.getTargetIdFromName(
          projectId,
          targetName,
        );

        await page
          .getByRole('link', { name: `Back to ${orgName}`, exact: true })
          .click();
        await page.getByRole('link', { name: 'Back to Global' }).click();
        await page.getByRole('link', { name: 'Aliases' }).click();
        await expect(
          page
            .getByRole('navigation', { name: 'breadcrumbs' })
            .getByText('Aliases'),
        ).toBeVisible();
        alias = 'example.alias.' + nanoid();
        const aliasesPage = new AliasesPage(page);
        await aliasesPage.createAliasForTarget(alias, targetId);
        await page
          .getByRole('navigation', { name: 'Application local navigation' })
          .getByRole('link', { name: 'Orgs' })
          .click();
        await page.getByRole('link', { name: orgName }).click();
        await page.getByRole('link', { name: projectName }).click();

        connect = await boundaryCli.connectSshToAlias(alias);
        const sessionsPage = new SessionsPage(page);
        await sessionsPage.waitForSessionToBeVisible(targetName);
      } finally {
        if (connect) {
          connect.kill('SIGTERM');
        }
        await boundaryCli.authenticateBoundary(
          controllerAddr,
          adminAuthMethodId,
          adminLoginName,
          adminPassword,
        );

        if (orgId) {
          await boundaryCli.deleteScope(orgId);
        }
        if (alias) {
          await boundaryCli.deleteAlias(alias);
        }
      }
    },
  );
});
