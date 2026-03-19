/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect } from '@playwright/test';

export class BasePage {
  constructor(page) {
    this.page = page;
  }

  async goToRootLoggedIn() {
    await expect(async () => {
      await this.page.goto('/');
      await expect(
        this.page.getByRole('navigation', {
          name: 'Primary',
        }),
      ).toBeVisible({ timeout: 5000 });
    }).toPass({ timeout: 5000 });
  }

  async goToRootLoggedOut() {
    await expect(async () => {
      await this.page.goto('/');
      await expect(
        this.page.getByRole('button', { name: 'Sign In' }),
      ).toBeVisible({ timeout: 5000 });
    }).toPass({ timeout: 5000 });
  }

  async dismissSuccessAlert() {
    await expect(
      this.page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'Dismiss' }).click();
  }
}
