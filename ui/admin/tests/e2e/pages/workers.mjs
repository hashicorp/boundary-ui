/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { BaseResourcePage } from './base-resource.mjs';

export class WorkersPage extends BaseResourcePage {
  async deleteResource() {
    await this.page.getByText('Manage').click();
    await this.page.getByRole('button', { name: 'Remove Worker' }).click();
    await this.page.getByText('OK', { exact: true }).click();
    await this.dismissSuccessAlert();
  }
}
