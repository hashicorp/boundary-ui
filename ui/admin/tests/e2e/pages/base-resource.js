/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

/* eslint-disable no-undef */
const BasePage = require('./base');

class BaseResourcePage extends BasePage {
  async deleteResource() {
    await this.page.getByText('Manage').click();
    await this.page.getByRole('button', { name: 'Delete' }).click();
    await this.page.getByText('OK', { exact: true }).click();
    await this.dismissSuccessAlert();
  }
}

module.exports = BaseResourcePage;
