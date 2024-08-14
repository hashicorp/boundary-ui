/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect } from '@playwright/test';
import { nanoid } from 'nanoid';

import { BaseResourcePage } from './base-resource';

export class ProjectsPage extends BaseResourcePage {
  /**
   * Creates a new project. Assumes you have selected the desired org.
   * @returns Name of the project
   */
  async createProject() {
    const projectName = 'Project ' + nanoid();
    await this.page
      .getByRole('navigation', { name: 'General' })
      .getByRole('link', { name: 'Projects' })
      .click();
    await this.page.getByRole('link', { name: 'New', exact: true }).click();
    await this.page.getByLabel('Name').fill(projectName);
    await this.page.getByLabel('Description').fill('This is an automated test');
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(projectName),
    ).toBeVisible();

    return projectName;
  }
}
