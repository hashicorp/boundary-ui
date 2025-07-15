/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect } from '@playwright/test';
import { nanoid } from 'nanoid';
import { readFile } from 'fs/promises';

import { BaseResourcePage } from './base-resource.js';

export class CredentialStoresPage extends BaseResourcePage {
  /**
   * Creates a static credential store. Assumes you have selected the desired project.
   * @returns Name of the credential store
   */
  async createStaticCredentialStore() {
    const credentialStoreName = 'Credential Store ' + nanoid();
    await this.page
      .getByRole('navigation', { name: 'Application local navigation' })
      .getByRole('link', { name: 'Credential Stores' })
      .click();
    await this.page.getByRole('link', { name: 'New', exact: true }).click();
    await this.page.getByLabel('Name (Optional)').fill(credentialStoreName);
    await this.page.getByLabel('Description').fill('This is an automated test');
    await this.page
      .getByRole('group', { name: 'Type' })
      .getByLabel('Static')
      .click();
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(credentialStoreName),
    ).toBeVisible();

    return credentialStoreName;
  }

  /**
   * Creates a vault credential store. Assumes you have selected the desired project.
   * @param {string} vaultAddr address of the vault server
   * @param {string} clientToken vault token to connect to boundary
   * @returns Name of the credential store
   */
  async createVaultCredentialStore(vaultAddr, clientToken) {
    const credentialStoreName = 'Credential Store ' + nanoid();
    await this.page
      .getByRole('navigation', { name: 'Application local navigation' })
      .getByRole('link', { name: 'Credential Stores' })
      .click();
    await this.page.getByRole('link', { name: 'New', exact: true }).click();
    await this.page.getByLabel('Name (Optional)').fill(credentialStoreName);
    await this.page.getByLabel('Description').fill('This is an automated test');
    await this.page
      .getByRole('group', { name: 'Type' })
      .getByLabel('Vault')
      .click();
    await this.page.getByLabel('Address').fill(vaultAddr);
    await this.page.getByLabel('Token').fill(clientToken);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(credentialStoreName),
    ).toBeVisible();

    return credentialStoreName;
  }

  /**
   * Creates a vault credential store. Assumes you have selected the desired project.
   * @param {string} vaultAddr address of the vault server
   * @param {string} clientToken vault token to connect to boundary
   * @param {string} workerFilter Worker filter for the Storage Bucket
   * @returns Name of the credential store
   */
  async createVaultCredentialStoreWithWorkerFilter(
    vaultAddr,
    clientToken,
    workerFilter,
  ) {
    const credentialStoreName = 'Credential Store ' + nanoid();
    await this.page
      .getByRole('navigation', { name: 'Application local navigation' })
      .getByRole('link', { name: 'Credential Stores' })
      .click();
    await this.page.getByRole('link', { name: 'New', exact: true }).click();
    await this.page.getByLabel('Name (Optional)').fill(credentialStoreName);
    await this.page.getByLabel('Description').fill('This is an automated test');
    await this.page
      .getByRole('group', { name: 'Type' })
      .getByLabel('Vault')
      .click();
    await this.page.getByLabel('Address').fill(vaultAddr);
    await this.page
      .getByLabel('Worker filter')
      .getByRole('textbox')
      .fill(workerFilter);
    await this.page.getByLabel('Token').fill(clientToken);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(credentialStoreName),
    ).toBeVisible();

    return credentialStoreName;
  }

  /**
   * Creates a static key pair credential. Assumes you have selected the desired project.
   * @param {string} username username for the credential
   * @param {string} keyPath path to the private key
   * @returns Name of the credential
   */
  async createStaticCredentialKeyPair(username, keyPath) {
    const credentialName = 'Credential ' + nanoid();

    const credentialsBreadcrumbIsVisible = await this.page
      .getByRole('breadcrumbs', { name: 'Credentials' })
      .isVisible();
    if (credentialsBreadcrumbIsVisible) {
      await this.page.getByRole('breadcrumbs', { name: 'Credentials' }).click();
    } else {
      await this.page
        .getByRole('link', { name: 'Credentials', exact: true })
        .click();
    }

    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText('Credentials'),
    ).toBeVisible();

    const newButtonIsVisible = await this.page
      .getByRole('link', { name: 'New', exact: true })
      .isVisible();
    if (newButtonIsVisible) {
      await this.page.getByRole('link', { name: 'New', exact: true }).click();
    } else {
      await this.page.getByText('Manage').click();
      await this.page.getByRole('link', { name: 'New Credential' }).click();
    }

    await this.page.getByLabel('Name (Optional)').fill(credentialName);
    await this.page.getByLabel('Description').fill('This is an automated test');
    await this.page
      .getByRole('group', { name: 'Type' })
      .getByLabel('Username & Key Pair')
      .click();
    await this.page.getByLabel('Username', { exact: true }).fill(username);
    const keyData = await readFile(keyPath, {
      encoding: 'utf-8',
    });
    await this.page.getByLabel('SSH Private Key').fill(keyData);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(credentialName),
    ).toBeVisible();

    return credentialName;
  }

  /**
   * Creates a static username and password credential.
   * Assumes you have selected the desired project.
   * @param {string} username username for the credential
   * @param {string} password password for the credential
   * @returns Name of the credential
   */
  async createStaticCredentialUsernamePassword(username, password) {
    const credentialsBreadcrumbIsVisible = await this.page
      .getByRole('breadcrumbs', { name: 'Credentials' })
      .isVisible();
    if (credentialsBreadcrumbIsVisible) {
      await this.page.getByRole('breadcrumbs', { name: 'Credentials' }).click();
    } else {
      await this.page
        .getByRole('link', { name: 'Credentials', exact: true })
        .click();
    }

    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText('Credentials'),
    ).toBeVisible();

    const newButtonIsVisible = await this.page
      .getByRole('link', { name: 'New', exact: true })
      .isVisible();
    if (newButtonIsVisible) {
      await this.page.getByRole('link', { name: 'New', exact: true }).click();
    } else {
      await this.page.getByText('Manage').click();
      await this.page.getByRole('link', { name: 'New Credential' }).click();
    }

    const credentialName = 'Credential ' + nanoid();
    await this.page.getByLabel('Name (Optional)').fill(credentialName);
    await this.page.getByLabel('Description').fill('This is an automated test');
    await this.page
      .getByRole('group', { name: 'Type' })
      .getByLabel('Username & Password')
      .click();
    await this.page.getByLabel('Username', { exact: true }).fill(username);
    await this.page.getByLabel('Password', { exact: true }).fill(password);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(credentialName),
    ).toBeVisible();

    return credentialName;
  }

  /**
   * Creates a vault-generic credential library. Assumes you have selected
   * the desired credential store.
   * @param {string} vaultPath path to secret in vault
   * @param {string} credentialType type of credential for credential injection.
   * Can be set to null if injection is not used
   * @returns Name of the credential library
   */
  async createVaultGenericCredentialLibraryEnt(vaultPath, credentialType) {
    const credentialLibraryName = 'Credential Library ' + nanoid();
    await this.page.getByRole('link', { name: 'Credential Libraries' }).click();
    await this.page.getByRole('link', { name: 'New', exact: true }).click();
    await this.page
      .getByLabel('Name (Optional)', { exact: true })
      .fill(credentialLibraryName);
    await this.page
      .getByLabel('Description (Optional)')
      .fill('This is an automated test');
    await this.page
      .getByRole('group', { name: 'Type' })
      .getByLabel('Generic Secrets')
      .click();
    await this.page.getByLabel('Vault Path').fill(vaultPath);

    if (credentialType) {
      await this.page
        .getByRole('combobox', { name: 'Credential Type' })
        .selectOption(credentialType);
    }

    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();

    return credentialLibraryName;
  }

  /**
   * Creates a vault-ssh-certificate credential library. Assumes you have selected
   * the desired credential store.
   * @param {string} vaultPath path to secret in vault
   * @param {string} username username for the credential
   * @returns Name of the credential library
   */
  async createVaultSshCertificateCredentialLibraryEnt(vaultPath, username) {
    const credentialLibraryName = 'Credential Library ' + nanoid();

    await this.page.getByRole('link', { name: 'Credential Libraries' }).click();
    await this.page.getByRole('link', { name: 'New', exact: true }).click();

    await this.page
      .getByLabel('Name (Optional)', { exact: true })
      .fill(credentialLibraryName);
    await this.page
      .getByLabel('Description (Optional)')
      .fill('This is an automated test');
    await this.page
      .getByRole('group', { name: 'Type' })
      .getByLabel('SSH Certificates')
      .click();
    await this.page.getByLabel('Vault Path').fill(vaultPath);
    await this.page.getByLabel('Username').fill(username);
    await this.page.getByLabel('Key Type').selectOption('ecdsa');
    await this.page.getByLabel('Key Bits').fill('521');

    await this.page
      .getByRole('group', { name: 'Extensions' })
      .getByLabel('Key')
      .fill('permity-pty');
    await this.page
      .getByRole('group', { name: 'Extensions' })
      .getByRole('button', { name: 'Add' })
      .click();

    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();

    return credentialLibraryName;
  }
}
