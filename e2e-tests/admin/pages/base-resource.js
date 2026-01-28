/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { BasePage } from './base.js';

export class BaseResourcePage extends BasePage {
  async deleteResource() {
    await this.page.getByText('Manage').click();
    await this.page.getByRole('button', { name: 'Delete' }).click();
    await this.page.getByText('OK', { exact: true }).click();
    await this.dismissSuccessAlert();
  }
}
