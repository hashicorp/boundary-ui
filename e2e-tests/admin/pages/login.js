/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect } from '@playwright/test';

import { BaseResourcePage } from './base-resource.js';

export class LoginPage extends BaseResourcePage {
  /**
   * Logs in to the Admin UI
   * @param {string} loginName Username to log in with
   * @param {string} password Password to log in with
   */
  async login(loginName, password) {
    await this.page.getByLabel('Login Name').fill(loginName);
    await this.page.getByLabel('Password', { exact: true }).fill(password);
    await this.page.getByRole('button', { name: 'Sign In' }).click();
    await expect(
      this.page.getByRole('navigation', {
        name: 'Application local navigation',
      }),
    ).toBeVisible();
    await expect(this.page.getByText(loginName)).toBeEnabled();
  }

  /**
   * Logs out of the Admin UI
   * @param {string} loginName Username to log out
   */
  async logout(loginName) {
    await this.page.getByText(loginName).click();
    await this.page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(
      this.page.getByRole('button', { name: 'Sign In' }),
    ).toBeVisible();
  }
}
