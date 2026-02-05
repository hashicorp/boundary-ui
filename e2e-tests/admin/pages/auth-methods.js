/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect } from '@playwright/test';
import { nanoid } from 'nanoid';

import { BaseResourcePage } from './base-resource.js';

export class AuthMethodsPage extends BaseResourcePage {
  /**
   * Creates a new Password Auth Method. Assumes you have selected the desired scope.
   * @returns Name of the auth method
   */
  async createPasswordAuthMethod() {
    const authMethodName = 'Auth Method ' + nanoid();
    await this.page
      .getByRole('navigation', { name: 'Application local navigation' })
      .getByRole('link', { name: 'Auth Methods' })
      .click();
    await this.page.getByRole('button', { name: 'New', exact: true }).click();
    await this.page.getByText('Password', { exact: true }).click();
    await this.page.getByLabel('Name').fill(authMethodName);
    await this.page.getByRole('button', { name: 'Save', exact: true }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(authMethodName),
    ).toBeVisible();

    return authMethodName;
  }

  /**
   * Creates a new OIDC Auth Method. Assumes you have selected the desired scope.
   * @param {string} issuer OIDC issuer
   * @param {string} clientId OIDC client ID
   * @param {string} clientSecret OIDC client secret
   * @returns Name of the auth method
   */
  async createOidcAuthMethod(issuer, clientId, clientSecret, boundaryAddr) {
    const authMethodName = 'Auth Method ' + nanoid();
    await this.page
      .getByRole('navigation', { name: 'Application local navigation' })
      .getByRole('link', { name: 'Auth Methods' })
      .click();
    await this.page.getByRole('button', { name: 'New', exact: true }).click();
    await this.page.getByRole('link', { name: 'OIDC' }).click();
    await this.page.getByLabel('Name').fill(authMethodName);
    await this.page.getByLabel('Description').fill('OIDC Auth Method');
    await this.page.getByLabel('Issuer').fill(issuer);
    await this.page.getByLabel('Client ID').fill(clientId);
    await this.page.getByLabel('Client Secret').fill(clientSecret);
    await this.page
      .getByRole('group', { name: 'Signing Algorithms' })
      .getByRole('combobox')
      .selectOption('RS256');
    await this.page
      .getByRole('group', { name: 'Signing Algorithms' })
      .getByRole('button', { name: 'Add' })
      .click();

    await this.page
      .getByRole('group', { name: 'Claims Scopes' })
      .getByRole('textbox')
      .last()
      .fill('groups');
    await this.page
      .getByRole('group', { name: 'Claims Scopes' })
      .getByRole('button', { name: 'Add' })
      .click();
    await this.page
      .getByRole('group', { name: 'Claims Scopes' })
      .getByRole('textbox')
      .last()
      .fill('user');
    await this.page
      .getByRole('group', { name: 'Claims Scopes' })
      .getByRole('button', { name: 'Add' })
      .click();

    await this.page
      .getByRole('group', { name: 'Account Claim Maps' })
      .getByLabel('From Claim')
      .last()
      .fill('username');
    await this.page
      .getByRole('group', { name: 'Account Claim Maps' })
      .getByLabel('To Claim')
      .last()
      .selectOption('name');
    await this.page
      .getByRole('group', { name: 'Account Claim Maps' })
      .getByRole('button', { name: 'Add' })
      .click();
    await this.page
      .getByRole('group', { name: 'Account Claim Maps' })
      .getByLabel('From Claim')
      .last()
      .fill('email');
    await this.page
      .getByRole('group', { name: 'Account Claim Maps' })
      .getByLabel('To Claim')
      .last()
      .selectOption('email');
    await this.page
      .getByRole('group', { name: 'Account Claim Maps' })
      .getByRole('button', { name: 'Add' })
      .click();

    await this.page.getByLabel('Maximum Age').fill('20');
    await this.page.getByLabel('API URL Prefix').fill(boundaryAddr);

    await this.page.getByRole('button', { name: 'Save', exact: true }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(authMethodName),
    ).toBeVisible();

    return authMethodName;
  }

  /**
   * Makes the first available auth method primary.
   * Assumes you have created new auth method.
   */
  async makeAuthMethodPrimary() {
    await this.page
      .getByRole('navigation', { name: 'Application local navigation' })
      .getByRole('link', { name: 'Auth Methods' })
      .click();
    await this.page.getByLabel('Manage').click();
    await this.page.getByRole('button', { name: 'Make Primary' }).click();
    await this.page.getByText('OK', { exact: true }).click();
    await this.dismissSuccessAlert();
  }

  /**
   * Removes auth method as primary. Assume you have selected the desired auth method.
   */
  async removeAuthMethodAsPrimary() {
    await this.page.getByRole('button', { name: 'Manage' }).click();
    await this.page.getByRole('button', { name: 'Remove as primary' }).click();
    await this.page.getByText('OK', { exact: true }).click();
    await this.dismissSuccessAlert();
  }

  /**
   * Creates a new password Account. Assumes you have selected the desired Auth Method
   * which the account will be created for.
   * @param {string} login Login of new account
   * @param {string} password Password of new account
   * @returns Name of the account
   */
  async createPasswordAccount(login, password) {
    const accountName = 'Account ' + nanoid();

    await this.page.getByRole('link', { name: 'Accounts' }).click();
    await this.page
      .getByRole('link', { name: 'Create Account', exact: true })
      .click();
    await this.page.getByLabel('Name (Optional)').fill(accountName);
    await this.page.getByLabel('Login Name').fill(login);
    await this.page.getByLabel('Password', { exact: true }).fill(password);
    await this.page.getByRole('button', { name: 'Save', exact: true }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(accountName),
    ).toBeVisible();

    return accountName;
  }

  /**
   * Sets a new password to an account. Assumes you have selected the desired Account.
   * @param {string} password New password of the account
   */
  async setPasswordToAccount(password) {
    await this.page.getByRole('link', { name: 'Set Password' }).click();
    await this.page.getByLabel(new RegExp('Password*')).fill(password);
    await this.page.getByRole('button', { name: 'Save', exact: true }).click();
    await this.dismissSuccessAlert();
  }
}
