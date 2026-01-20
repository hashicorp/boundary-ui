/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect } from '@playwright/test';
import { nanoid } from 'nanoid';

import { BaseResourcePage } from './base-resource.js';

export class AliasesPage extends BaseResourcePage {
  /**
   * Creates an alias
   * @param {string} alias Value of the alias
   * @param {string} targetId ID of the target
   * @returns Name of the alias
   */
  async createAliasForTarget(alias, targetId) {
    const aliasName = 'Alias ' + nanoid();

    const newButtonIsVisible = await this.page
      .getByRole('link', { name: 'Create a new alias', exact: true })
      .isVisible();
    if (newButtonIsVisible) {
      await this.page
        .getByRole('link', { name: 'Create a new alias', exact: true })
        .click();
    } else {
      await this.page
        .getByRole('link', { name: 'New Alias', exact: true })
        .click();
    }

    await this.page.getByLabel('Name').fill(aliasName);
    await this.page.getByLabel('Description').fill('This is an automated test');
    await this.page.getByLabel('Alias Value').fill(alias);
    await this.page.getByLabel('Target ID').fill(targetId);

    await this.page.getByRole('button', { name: 'Save', exact: true }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(aliasName),
    ).toBeVisible();

    return aliasName;
  }
}
