/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect } from '@playwright/test';
import { nanoid } from 'nanoid';

import { BaseResourcePage } from './base-resource.js';

export class RolesPage extends BaseResourcePage {
  goToRolesPage({ scope }) {
    scope = scope ?? 'global';
    this.page.goto(`/scopes/${scope}/roles`);
  }

  /**
   * Creates a new role. Assumes you have selected the desired scope.
   */
  async createRole() {
    const roleName = 'Role ' + nanoid();

    await this.page
      .getByRole('navigation', { name: 'Application local navigation' })
      .getByRole('link', { name: 'Roles' })
      .click();
    await this.page.getByRole('link', { name: 'New Role' }).click();
    await this.page.getByLabel('Name').fill(roleName);
    await this.page.getByRole('button', { name: 'Save', exact: true }).click();
    await this.dismissSuccessAlert();
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
      .getByRole('link', { name: 'Add Principals', exact: true })
      .click();
    await this.page.getByRole('checkbox', { name: principalName }).click();
    await this.page
      .getByRole('button', { name: 'Add Principals', exact: true })
      .click();
    await this.dismissSuccessAlert();
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
    await this.dismissSuccessAlert();
    await expect(
      this.page.getByRole('textbox', { name: 'Grant', exact: true }),
    ).toHaveValue(grants);
  }
}
