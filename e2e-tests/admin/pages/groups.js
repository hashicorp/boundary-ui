/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect } from '@playwright/test';
import { nanoid } from 'nanoid';

import { BaseResourcePage } from './base-resource.js';

export class GroupsPage extends BaseResourcePage {
  /**
   * Creates a new group. Assumes you have selected the desired scope.
   * @returns Name of the group
   */
  async createGroup() {
    const groupName = 'Group ' + nanoid();
    await this.page
      .getByRole('navigation', { name: 'Application local navigation' })
      .getByRole('link', { name: 'Groups' })
      .click();
    await this.page.getByRole('link', { name: 'New', exact: true }).click();
    await this.page.getByLabel('Name').fill(groupName);
    await this.page.getByRole('button', { name: 'Save', exact: true }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(groupName),
    ).toBeVisible();

    return groupName;
  }

  /**
   * Adds a user to the group. Assumes you have selected the desired group.
   * @param {string} userName Name of the user that will be added to the group
   */
  async addMemberToGroup(userName) {
    await this.page.getByRole('link', { name: 'Members', exact: true }).click();
    await this.page
      .getByRole('link', { name: 'Add Members', exact: true })
      .click();
    await this.page.getByRole('checkbox', { name: userName }).click();
    await this.page
      .getByRole('button', { name: 'Add Members', exact: true })
      .click();
    await this.dismissSuccessAlert();
    await expect(
      this.page.getByRole('table').getByText(userName),
    ).toBeVisible();
  }
}
