/**
 * Copyright (c) HashiCorp, Inc.
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
    await this.page.getByRole('button', { name: 'Save' }).click();
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
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page.getByRole('listitem').getByText(policyName),
    ).toBeVisible();
  }
}
