/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect } from '@playwright/test';

export class BasePage {
  constructor(page) {
    this.page = page;
  }

  async dismissSuccessAlert() {
    await expect(
      this.page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'Dismiss' }).click();
  }
}
