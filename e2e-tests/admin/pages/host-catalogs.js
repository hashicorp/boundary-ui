/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect } from '@playwright/test';
import { nanoid } from 'nanoid';

import { BaseResourcePage } from './base-resource.js';

export class HostCatalogsPage extends BaseResourcePage {
  /**
   * Creates a new host catalog. Assumes you have selected the desired project.
   * @returns Name of the host catalog
   */
  async createHostCatalog() {
    const hostCatalogName = 'Host Catalog ' + nanoid();
    await this.page
      .getByRole('navigation', { name: 'Application local navigation' })
      .getByRole('link', { name: 'Host Catalogs' })
      .click();
    await expect(
      this.page.getByRole('heading', { name: 'Host Catalogs' }),
    ).toBeVisible();

    const newButtonIsVisible = await this.page
      .getByRole('link', { name: 'New', exact: true })
      .isVisible();
    if (newButtonIsVisible) {
      await this.page.getByRole('link', { name: 'New', exact: true }).click();
    } else {
      await this.page
        .getByRole('link', { name: 'New Host Catalog', exact: true })
        .click();
    }

    await this.page.getByLabel('Name').fill(hostCatalogName);
    await this.page.getByLabel('Description').fill('This is an automated test');
    await this.page
      .getByRole('group', { name: 'Type', exact: 'true' })
      .getByLabel('Static')
      .click();
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(hostCatalogName),
    ).toBeVisible();

    return hostCatalogName;
  }

  /**
   * Creates a new host set. Assumes you have just created a new host catalog.
   * @returns Name of the host set
   */
  async createHostSet() {
    const hostSetName = 'Host Set ' + nanoid();
    await this.page.getByRole('link', { name: 'Host Sets' }).click();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText('Host Sets'),
    ).toBeVisible();

    const emptyLinkIsVisible = await this.page
      .getByRole('link', { name: 'New', exact: true })
      .isVisible();
    if (emptyLinkIsVisible) {
      await this.page.getByRole('link', { name: 'New', exact: true }).click();
    } else {
      await this.page.getByText('Manage').click();
      await this.page.getByRole('link', { name: 'New Host Set' }).click();
    }

    await this.page.getByLabel('Name').fill(hostSetName);
    await this.page.getByLabel('Description').fill('This is an automated test');
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(hostSetName),
    ).toBeVisible();

    return hostSetName;
  }

  /**
   * Creates a new host in a host set. Assumes you have just created a new host set.
   * @param {string} address Address of the host
   * @returns Name of the host
   */
  async createHostInHostSet(address) {
    const hostName = 'Host ' + nanoid();
    await this.page.getByText('Manage').click();
    await this.page.getByRole('link', { name: 'Create and Add Host' }).click();
    await this.page.getByLabel('Name').fill(hostName);
    await this.page.getByLabel('Description').fill('This is an automated test');
    await this.page.getByLabel('Address').fill(address);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();
    await expect(this.page.getByRole('link', { name: hostName })).toBeVisible();

    return hostName;
  }
}
