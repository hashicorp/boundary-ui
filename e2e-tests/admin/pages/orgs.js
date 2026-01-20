/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect } from '@playwright/test';
import { nanoid } from 'nanoid';

import { BaseResourcePage } from './base-resource.js';

export class OrgsPage extends BaseResourcePage {
  /**
   * Creates a new organization
   * @returns Name of the organization
   */
  async createOrg() {
    const orgName = 'Org ' + nanoid();
    await this.page
      .getByRole('navigation', { name: 'Application local navigation' })
      .getByRole('link', { name: 'Orgs' })
      .click();
    await this.page.getByRole('link', { name: 'New Org' }).click();
    await this.page.getByLabel('Name').fill(orgName);
    await this.page.getByLabel('Description').fill('This is an automated test');
    await this.page.getByRole('button', { name: 'Save', exact: true }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(orgName),
    ).toBeVisible();

    return orgName;
  }

  /**
   * Attaches a Storage Policy to a scope. Assumes you have selected the desired scope.
   * @param {string} policyName name of the Policy to be attached to the scope
   */
  async attachStoragePolicy(policyName) {
    await this.page
      .getByRole('link', { name: new RegExp('/*Settings'), exact: true })
      .click();
    await this.page.getByText('Add Storage Policy').click();
    await this.page
      .getByLabel('Storage Policy')
      .selectOption({ label: policyName });
    await this.page.getByRole('button', { name: 'Save', exact: true }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page.getByRole('listitem').getByText(policyName),
    ).toBeVisible();
  }

  /**
   * Switches the scope using the dropdown on the top menu bar.
   * @param {string} fromScope the current scope, required to click dropdown
   * @param {string} toScope name of the scope to click in the dropdown
   */
  async chooseScopeFromDropdown(fromScope, toScope) {
    await this.page
      .getByRole('button', { name: fromScope, exact: true })
      .click();
    await this.page.getByRole('option', { name: toScope, exact: true }).click();
    await expect(
      this.page.getByRole('button', { name: toScope, exact: true }),
    ).toBeVisible();
    if (toScope !== 'Global') {
      await expect(
        this.page.getByRole('link', { name: toScope, exact: true }),
      ).toBeVisible();
    }
  }
}
