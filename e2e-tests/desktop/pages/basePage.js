/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect } from '../fixtures/baseTest.js';

export default class BasePage {
  constructor(page) {
    this.page = page;
  }

  async dismissSuccessAlert() {
    await expect(
      this.page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await this.page
      .getByRole('alert')
      .getByRole('button', { name: 'Dismiss', exact: true })
      .click();
  }
}
