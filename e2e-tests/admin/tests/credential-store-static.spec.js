/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../../global-setup.js';
import { expect } from '@playwright/test';
import { readFile } from 'fs/promises';
import { nanoid } from 'nanoid';

import * as boundaryCli from '../../helpers/boundary-cli';
import { CredentialStoresPage } from '../pages/credential-stores.js';
import { OrgsPage } from '../pages/orgs.js';
import { ProjectsPage } from '../pages/projects.js';
import { SessionsPage } from '../pages/sessions.js';
import { TargetsPage } from '../pages/targets.js';

test.beforeAll(async () => {
  await boundaryCli.checkBoundaryCli();
});

let orgName;
let projectName;
let targetName;

test.beforeEach(async ({ page, targetAddress, targetPort }) => {
  await page.goto('/');

  const orgsPage = new OrgsPage(page);
  orgName = await orgsPage.createOrg();
  const projectsPage = new ProjectsPage(page);
  projectName = await projectsPage.createProject();
  const targetsPage = new TargetsPage(page);
  targetName = await targetsPage.createTarget({
    port: targetPort,
    address: targetAddress,
  });
  const credentialStoresPage = new CredentialStoresPage(page);
  await credentialStoresPage.createStaticCredentialStore();
});

test(
  'Static Credential Store (User & Key Pair)',
  { tag: ['@ce', '@aws', '@docker'] },
  async ({
    page,
    controllerAddr,
    adminAuthMethodId,
    adminLoginName,
    adminPassword,
    sshUser,
    sshKeyPath,
  }) => {
    try {
      const credentialStoresPage = new CredentialStoresPage(page);
      const credentialName =
        await credentialStoresPage.createStaticCredentialKeyPair(
          sshUser,
          sshKeyPath,
        );
      const targetsPage = new TargetsPage(page);
      await targetsPage.addBrokeredCredentialsToTarget(
        targetName,
        credentialName,
      );

      await boundaryCli.authenticateBoundary(
        controllerAddr,
        adminAuthMethodId,
        adminLoginName,
        adminPassword,
      );
      const orgId = await boundaryCli.getOrgIdFromName(orgName);
      const projectId = await boundaryCli.getProjectIdFromName(
        orgId,
        projectName,
      );
      const targetId = await boundaryCli.getTargetIdFromName(
        projectId,
        targetName,
      );
      const session = await boundaryCli.authorizeSessionByTargetId(targetId);
      const retrievedUser = session.item.credentials[0].credential.username;
      const retrievedKey = session.item.credentials[0].credential.private_key;

      expect(retrievedUser).toBe(sshUser);

      const keyData = await readFile(sshKeyPath, {
        encoding: 'utf-8',
      });
      expect(retrievedKey).toBe(keyData);

      const sessionsPage = new SessionsPage(page);
      await sessionsPage.waitForSessionToBeVisible(targetName);
    } finally {
      if (orgName) {
        await boundaryCli.authenticateBoundary(
          controllerAddr,
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
  },
);

test(
  'Static Credential Store (Username & Password)',
  { tag: ['@ce', '@aws', '@docker'] },
  async ({
    page,
    controllerAddr,
    adminAuthMethodId,
    adminLoginName,
    adminPassword,
    sshUser,
  }) => {
    try {
      const testPassword = 'password';
      const credentialStoresPage = new CredentialStoresPage(page);
      const credentialName =
        await credentialStoresPage.createStaticCredentialUsernamePassword(
          sshUser,
          testPassword,
        );
      const targetsPage = new TargetsPage(page);
      await targetsPage.addBrokeredCredentialsToTarget(
        targetName,
        credentialName,
      );

      await boundaryCli.authenticateBoundary(
        controllerAddr,
        adminAuthMethodId,
        adminLoginName,
        adminPassword,
      );
      const orgId = await boundaryCli.getOrgIdFromName(orgName);
      const projectId = await boundaryCli.getProjectIdFromName(
        orgId,
        projectName,
      );
      const targetId = await boundaryCli.getTargetIdFromName(
        projectId,
        targetName,
      );
      const session = await boundaryCli.authorizeSessionByTargetId(targetId);
      const retrievedUser = session.item.credentials[0].credential.username;
      const retrievedPassword = session.item.credentials[0].credential.password;

      expect(retrievedUser).toBe(sshUser);
      expect(retrievedPassword).toBe(testPassword);

      const sessionsPage = new SessionsPage(page);
      await sessionsPage.waitForSessionToBeVisible(targetName);
    } finally {
      if (orgName) {
        await boundaryCli.authenticateBoundary(
          controllerAddr,
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
  },
);

test(
  'Static Credential Store (JSON)',
  { tag: ['@ce', '@aws', '@docker'] },
  async ({
    page,
    controllerAddr,
    adminAuthMethodId,
    adminLoginName,
    adminPassword,
  }) => {
    try {
      const credentialName = 'Credential ' + nanoid();
      await page
        .getByRole('link', { name: 'Credentials', exact: true })
        .click();
      await page.getByRole('link', { name: 'New', exact: true }).click();
      await page.getByLabel('Name', { exact: true }).fill(credentialName);
      await page.getByLabel('Description').fill('This is an automated test');
      await page.getByRole('combobox', { name: 'Type' }).click();
      await page.getByRole('option', { name: 'JSON' }).click();
      await page.getByText('{}').click();
      const testName = 'name-json';
      const testPassword = 'password-json';
      const testId = 'id-json';
      await page.keyboard.type(
        `"username": "${testName}",
    "password": "${testPassword}",
    "id": "${testId}"`,
      );
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(
        page.getByRole('alert').getByText('Success', { exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Dismiss' }).click();
      await expect(
        page
          .getByRole('navigation', { name: 'breadcrumbs' })
          .getByText(credentialName),
      ).toBeVisible();

      const targetsPage = new TargetsPage(page);
      await targetsPage.addBrokeredCredentialsToTarget(
        targetName,
        credentialName,
      );

      await boundaryCli.authenticateBoundary(
        controllerAddr,
        adminAuthMethodId,
        adminLoginName,
        adminPassword,
      );
      const orgId = await boundaryCli.getOrgIdFromName(orgName);
      const projectId = await boundaryCli.getProjectIdFromName(
        orgId,
        projectName,
      );
      const targetId = await boundaryCli.getTargetIdFromName(
        projectId,
        targetName,
      );
      const session = await boundaryCli.authorizeSessionByTargetId(targetId);
      const retrievedUser = session.item.credentials[0].credential.username;
      const retrievedPassword = session.item.credentials[0].credential.password;
      const retrievedId = session.item.credentials[0].credential.id;

      expect(retrievedUser).toBe(testName);
      expect(retrievedPassword).toBe(testPassword);
      expect(retrievedId).toBe(testId);

      const sessionsPage = new SessionsPage(page);
      await sessionsPage.waitForSessionToBeVisible(targetName);
    } finally {
      if (orgName) {
        await boundaryCli.authenticateBoundary(
          controllerAddr,
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
  },
);

test(
  'Multiple Credential Stores (CE)',
  { tag: ['@ce', '@aws', '@docker'] },
  async ({
    page,
    controllerAddr,
    adminAuthMethodId,
    adminLoginName,
    adminPassword,
    sshUser,
    sshKeyPath,
  }) => {
    try {
      const credentialStoresPage = new CredentialStoresPage(page);
      const credentialName =
        await credentialStoresPage.createStaticCredentialKeyPair(
          sshUser,
          sshKeyPath,
        );
      const credentialName2 =
        await credentialStoresPage.createStaticCredentialUsernamePassword(
          sshUser,
          'testPassword',
        );

      const targetsPage = new TargetsPage(page);
      await targetsPage.addBrokeredCredentialsToTarget(
        targetName,
        credentialName,
      );
      await targetsPage.addBrokeredCredentialsToTarget(
        targetName,
        credentialName2,
      );

      // Remove the host source from the target
      await page
        .getByRole('row')
        .filter({ has: page.getByRole('link', { name: credentialName2 }) })
        .getByRole('button', { name: 'Manage' })
        .click();
      await page.getByRole('button', { name: 'Remove' }).click();
      await page.getByRole('button', { name: 'OK', exact: true }).click();
      await expect(
        page.getByRole('alert').getByText('Success', { exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Dismiss' }).click();
    } finally {
      if (orgName) {
        await boundaryCli.authenticateBoundary(
          controllerAddr,
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
  },
);
