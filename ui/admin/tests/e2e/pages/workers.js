/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

const BaseResourcePage = require('./base-resource');

class WorkersPage extends BaseResourcePage {
  async deleteResource() {
    await this.page.getByText('Manage').click();
    await this.page.getByRole('button', { name: 'Remove Worker' }).click();
    await this.page.getByText('OK', { exact: true }).click();
    await this.dismissSuccessAlert();
  }
}

module.exports = WorkersPage;
