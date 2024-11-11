/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect } from '@playwright/test';
import { nanoid } from 'nanoid';

import { BaseResourcePage } from './base-resource.mjs';

export class StoragePoliciesPage extends BaseResourcePage {
  /**
   * Creates a Storage Policy. Assumes you have selected the desired scope.
   * @returns Name of the Storage Policy
   */
  async createStoragePolicy() {
    const storagePolicyName = 'Policy ' + nanoid();
    await this.page
      .getByRole('link', { name: 'Storage Policies', exact: true })
      .click();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText('Storage Policies'),
    ).toBeVisible();

    const newButtonIsVisible = await this.page
      .getByRole('link', { name: 'New Storage Policy', exact: true })
      .isVisible();
    if (newButtonIsVisible) {
      await this.page
        .getByRole('link', { name: 'New Storage Policy', exact: true })
        .click();
    } else {
      await this.page
        .getByRole('link', { name: 'Create a new storage policy', exact: true })
        .click();
    }

    await this.page.getByLabel('Name').fill(storagePolicyName);
    await this.page
      .getByLabel('Retention Policy')
      .selectOption({ label: 'Forever' });
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(storagePolicyName),
    ).toBeVisible();

    return storagePolicyName;
  }
}
