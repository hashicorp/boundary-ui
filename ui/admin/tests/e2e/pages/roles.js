/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

/* eslint-disable no-undef */
const { expect } = require('@playwright/test');
const { nanoid } = require('nanoid');

class RolesPage {
  constructor(page) {
    this.page = page;
  }

  /**
   * Creates a new role. Assumes you have selected the desired scope.
   */
  async createRole() {
    const roleName = 'Role ' + nanoid();

    await this.page
      .getByRole('navigation', { name: 'IAM' })
      .getByRole('link', { name: 'Roles' })
      .click();
    await this.page.getByRole('link', { name: 'New Role' }).click();
    await this.page.getByLabel('Name').fill(roleName);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await expect(
      this.page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'Dismiss' }).click();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(roleName),
    ).toBeVisible();

    return roleName;
  }

  /**
   * Adds a principal to a role. Assumes you have selected the desired role.
   * @param {string} principalName Name of the principal that will be added to the role
   */
  async addPrincipalToRole(principalName) {
    await this.page
      .getByRole('link', { name: 'Principals', exact: true })
      .click();
    await this.page
      .getByRole('article')
      .getByRole('link', { name: 'Add Principals', exact: true })
      .click();
    await this.page.getByRole('checkbox', { name: principalName }).click();
    await this.page
      .getByRole('button', { name: 'Add Principals', exact: true })
      .click();
    await expect(
      this.page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'Dismiss' }).click();
    await expect(
      this.page.getByRole('table').getByRole('link', { name: principalName }),
    ).toBeVisible();
  }

  /**
   * Adds a grant to the role. Assumes you have selected the desired role.
   * @param {string} grants grants that will be given to the role
   */
  async addGrantsToRole(grants) {
    await this.page.getByRole('link', { name: 'Grants', exact: true }).click();
    await this.page.getByRole('textbox', { name: 'New Grant' }).fill(grants);
    await this.page.getByRole('button', { name: 'Add', exact: true }).click();
    await this.page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(
      this.page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'Dismiss' }).click();
    await expect(
      this.page.getByRole('textbox', { name: 'Grant', exact: true }),
    ).toHaveValue(grants);
  }
}

module.exports = RolesPage;
