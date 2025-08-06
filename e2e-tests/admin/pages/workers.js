/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { BaseResourcePage } from './base-resource.js';

export class WorkersPage extends BaseResourcePage {
  async deleteResource() {
    await this.page.getByText('Manage').click();
    await this.page.getByRole('button', { name: 'Remove Worker' }).click();
    await this.page.getByText('OK', { exact: true }).click();
    await this.dismissSuccessAlert();
  }

  /**
   * Creates a new API tag on a worker
   * @param {string} key API tag key
   * @param {string} value API tag value
   */
  async createNewTag(key, value) {
    await this.page.getByRole('button', { name: 'Manage' }).click();
    await this.page.getByRole('link', { name: 'Create New Tags' }).click();

    await this.page.getByLabel('Key').fill(key);
    await this.page.getByLabel('Value').fill(value);
    await this.page.getByRole('button', { name: 'Add' }).click();
    await this.page.getByRole('button', { name: 'Save' }).click();

    await this.dismissSuccessAlert();
  }

  /**
   * Edits an API tag on a worker
   * @param {string} origKey Original key for API tag
   * @param {string} newKey New key for API tag
   * @param {string} newValue New value for API tag
   */
  async editTag(origKey, newKey, newValue) {
    await this.page
      .getByRole('row')
      .filter({ has: this.page.getByRole('cell', { name: origKey }) })
      .getByRole('cell', { name: 'Overflow Options' })
      .click();
    await this.page.getByRole('button', { name: 'Edit Tag' }).click();

    await this.page.getByLabel('Key').fill(newKey);
    await this.page.getByLabel('Value').fill(newValue);
    await this.page.getByRole('button', { name: 'Save' }).click();

    await this.dismissSuccessAlert();
  }

  /**
   * Removes an API tag from a worker
   * @param {string} key API tag key
   */
  async removeTag(key) {
    await this.page
      .getByRole('row')
      .filter({ has: this.page.getByRole('cell', { name: key }) })
      .getByRole('cell', { name: 'Overflow Options' })
      .click();
    await this.page.getByRole('button', { name: 'Remove Tag' }).click();

    await this.page.getByLabel('Confirm removal').fill('REMOVE');
    await this.page.getByRole('button', { name: 'Remove' }).click();

    await this.dismissSuccessAlert();
  }
}
