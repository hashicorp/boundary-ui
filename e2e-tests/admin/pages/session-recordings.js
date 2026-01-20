/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { BaseResourcePage } from './base-resource.js';

export class SessionRecordingsPage extends BaseResourcePage {
  async deleteResource() {
    await this.page.getByText('Manage').click();
    await this.page.getByRole('button', { name: 'Delete recording' }).click();
    await this.page.getByText('OK', { exact: true }).click();
    await this.dismissSuccessAlert();
  }

  /**
   * Reapplies a storage policy to a session recording
   */
  async reapplyStoragePolicy() {
    await this.page.getByText('Manage').click();
    await this.page
      .getByRole('button', { name: 'Re-apply storage policy' })
      .click();
    await this.dismissSuccessAlert();
  }
}
