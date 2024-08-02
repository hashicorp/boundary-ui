/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

/* eslint-disable no-undef */
const { expect } = require('@playwright/test');

class BasePage {
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

module.exports = BasePage;
