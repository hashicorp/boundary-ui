/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

/* eslint-disable no-undef */
const { expect } = require('@playwright/test');
const { nanoid } = require('nanoid');

class GroupsPage {
  constructor(page) {
    this.page = page;
  }

  /**
   * Creates a new group. Assumes you have selected the desired scope.
   * @returns Name of the group
   */
  async createGroup() {
    const groupName = 'Group ' + nanoid();
    await this.page
      .getByRole('navigation', { name: 'IAM' })
      .getByRole('link', { name: 'Groups' })
      .click();
    await this.page.getByRole('link', { name: 'New', exact: true }).click();
    await this.page.getByLabel('Name').fill(groupName);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await expect(
      this.page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'Dismiss' }).click();
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
      .getByRole('article')
      .getByRole('link', { name: 'Add Members', exact: true })
      .click();
    await this.page.getByRole('checkbox', { name: userName }).click();
    await this.page
      .getByRole('button', { name: 'Add Members', exact: true })
      .click();
    await expect(
      this.page.getByRole('alert').getByText('Success', { exact: true }),
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'Dismiss' }).click();
    await expect(
      this.page.getByRole('table').getByText(userName),
    ).toBeVisible();
  }
}

module.exports = GroupsPage;
