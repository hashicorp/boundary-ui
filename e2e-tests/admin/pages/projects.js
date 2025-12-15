/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect } from '@playwright/test';
import { nanoid } from 'nanoid';

import { BaseResourcePage } from './base-resource.js';

export class ProjectsPage extends BaseResourcePage {
  /**
   * Creates a new project. Assumes you have selected the desired org.
   * @returns Name of the project
   */
  async createProject() {
    const projectName = 'Project ' + nanoid();
    await this.page
      .getByRole('navigation', { name: 'Application local navigation' })
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
