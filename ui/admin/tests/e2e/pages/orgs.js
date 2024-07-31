/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

/* eslint-disable no-undef */
const { expect } = require('@playwright/test');
const { nanoid } = require('nanoid');

class OrgsPage {
  constructor(page) {
    this.page = page;
  }

  /**
   * Creates a new organization
   * @returns Name of the organization
   */
  async createOrg() {
    const orgName = 'Org ' + nanoid();
    await this.page
      .getByRole('navigation', { name: 'General' })
      .getByRole('link', { name: 'Orgs' })
      .click();
    await this.page.getByRole('link', { name: 'New Org' }).click();
    await this.page.getByLabel('Name').fill(orgName);
    await this.page.getByLabel('Description').fill('This is an automated test');
    await this.page.getByRole('button', { name: 'Save' }).click();
    await expect(
      this.page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'Dismiss' }).click();
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
    await expect(
      this.page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'Dismiss' }).click();
    await expect(
      this.page.getByRole('listitem').getByText(policyName),
    ).toBeVisible();
  }
}

module.exports = OrgsPage;
