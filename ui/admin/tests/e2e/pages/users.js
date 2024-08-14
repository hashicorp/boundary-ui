/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect } from '@playwright/test';
import { nanoid } from 'nanoid';

import { BaseResourcePage } from './base-resource';

export class UsersPage extends BaseResourcePage {
  /**
   * Creates a new user.
   * @returns Name of the user
   */
  async createUser() {
    const userName = 'User ' + nanoid();
    await this.page
      .getByRole('navigation', { name: 'IAM' })
      .getByRole('link', { name: 'Users' })
      .click();
    await this.page.getByRole('link', { name: 'New', exact: true }).click();
    await this.page.getByLabel('Name').fill(userName);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(userName),
    ).toBeVisible();

    return userName;
  }

  /**
   * Adds an account to a user
   * Assumes you have selected the desired user.
   * Assumes you have created new account.
   * @param {string} loginName Login name of the account
   */
  async addAccountToUser(loginName) {
    await this.page
      .getByRole('link', { name: 'Accounts', exact: true })
      .click();
    await this.page
      .getByRole('article')
      .getByRole('link', { name: 'Add Accounts', exact: true })
      .click();
    await this.page
      .getByRole('cell', { name: loginName })
      .locator('..')
      .getByRole('checkbox')
      .click({ force: true });

    await this.page
      .getByRole('button', { name: 'Add Accounts', exact: true })
      .click();
    await this.dismissSuccessAlert();
  }
}
