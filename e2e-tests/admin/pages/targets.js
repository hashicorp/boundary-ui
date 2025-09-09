/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect } from '@playwright/test';
import { nanoid } from 'nanoid';

import { BaseResourcePage } from './base-resource.js';

export class TargetsPage extends BaseResourcePage {
  /**
   * Creates a new target. Assumes you have selected the desired project.
   * @param {string} port Port of the target
   * @returns Name of the target
   */
  async createTarget(port) {
    const targetName = 'Target ' + nanoid();
    await this.page
      .getByRole('navigation', { name: 'Application local navigation' })
      .getByRole('link', { name: 'Targets' })
      .click();
    await this.page.getByRole('link', { name: 'New', exact: true }).click();
    await this.page.getByLabel('Name').fill(targetName);
    await this.page.getByLabel('Description').fill('This is an automated test');
    await this.page.getByLabel('Default Port').fill(port);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(targetName),
    ).toBeVisible();

    return targetName;
  }

  /**
   * Creates a new target with address. Assumes you have selected the desired project.
   * @param {string} address Address of the target
   * @param {string} port Port of the target
   * @returns Name of the target
   */
  async createTargetWithAddress(address, port) {
    const targetName = 'Target ' + nanoid();
    await this.page
      .getByRole('navigation', { name: 'Application local navigation' })
      .getByRole('link', { name: 'Targets' })
      .click();
    await this.page.getByRole('link', { name: 'New', exact: true }).click();
    await this.page.getByLabel('Name').fill(targetName);
    await this.page.getByLabel('Description').fill('This is an automated test');
    await this.page.getByLabel('Target Address').fill(address);
    await this.page.getByLabel('Default Port').fill(port);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(targetName),
    ).toBeVisible();

    return targetName;
  }

  /**
   * Creates a new target with address and alias. Assumes you have selected the desired project.
   * @param {string} address Address of the target
   * @param {string} port Port of the target
   * @param {string} alias alias used for the target
   * @returns Name of the target
   */
  async createTargetWithAddressAndAlias(address, port, alias) {
    const targetName = 'Target ' + nanoid();
    await this.page
      .getByRole('navigation', { name: 'Application local navigation' })
      .getByRole('link', { name: 'Targets' })
      .click();
    await this.page.getByRole('link', { name: 'New', exact: true }).click();
    await this.page.getByLabel('Name').fill(targetName);
    await this.page.getByLabel('Description').fill('This is an automated test');
    await this.page.getByLabel('Target Address').fill(address);
    await this.page.getByLabel('Default Port').fill(port);
    await this.page
      .getByRole('group', { name: 'Aliases' })
      .getByLabel('value')
      .last()
      .fill(alias);
    await this.page.getByRole('button', { name: 'Add' }).click();

    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(targetName),
    ).toBeVisible();

    return targetName;
  }

  /**
   * Creates a new TCP target with address in boundary-enterprise
   * Assumes you have selected the desired project.
   * @param {string} address Address of the target
   * @param {string} port Port of the target
   * @returns Name of the target
   */
  async createTcpTargetWithAddressEnt(address, port) {
    const targetName = 'Target ' + nanoid();
    await this.page
      .getByRole('navigation', { name: 'Application local navigation' })
      .getByRole('link', { name: 'Targets' })
      .click();
    await this.page.getByRole('link', { name: 'New', exact: true }).click();
    await this.page.getByLabel('Name').fill(targetName);
    await this.page.getByLabel('Description').fill('This is an automated test');
    await this.page
      .getByRole('group', { name: 'Type' })
      .getByLabel('TCP')
      .click();
    await this.page.getByLabel('Target Address').fill(address);
    await this.page.getByLabel('Default Port').fill(port);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(targetName),
    ).toBeVisible();

    return targetName;
  }

  /**
   * Creates a new SSH target. Assumes you have selected the desired project.
   * @param {string} port Port of the target
   * @returns Name of the target
   */
  async createSshTargetEnt(port) {
    const targetName = 'Target ' + nanoid();
    await this.page
      .getByRole('navigation', { name: 'Application local navigation' })
      .getByRole('link', { name: 'Targets' })
      .click();
    await this.page.getByRole('link', { name: 'New', exact: true }).click();
    await this.page.getByLabel('Name').fill(targetName);
    await this.page.getByLabel('Description').fill('This is an automated test');
    await this.page
      .getByRole('group', { name: 'Type' })
      .getByLabel('SSH')
      .click();
    await this.page.getByLabel('Default Port').fill(port);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(targetName),
    ).toBeVisible();

    return targetName;
  }

  /**
   * Creates a new SSH target with address in boundary-enterprise
   * Assumes you have selected the desired project.
   * @param {string} address Address of the target
   * @param {string} port Port of the target
   * @returns Name of the target
   */
  async createSshTargetWithAddressEnt(address, port) {
    const targetName = 'Target ' + nanoid();
    await this.page
      .getByRole('navigation', { name: 'Application local navigation' })
      .getByRole('link', { name: 'Targets' })
      .click();
    await this.page.getByRole('link', { name: 'New', exact: true }).click();
    await this.page.getByLabel('Name').fill(targetName);
    await this.page.getByLabel('Description').fill('This is an automated test');
    await this.page
      .getByRole('group', { name: 'Type' })
      .getByLabel('SSH')
      .click();
    await this.page.getByLabel('Target Address').fill(address);
    await this.page.getByLabel('Default Port').fill(port);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(targetName),
    ).toBeVisible();

    return targetName;
  }

  /**
   * Creates a new SSH target with address and alias.
   * Assumes you have selected the desired project.
   * @param {string} address Address of the target
   * @param {string} port Port of the target
   * @param {string} alias alias used for the target
   * @returns Name of the target
   */
  async createSshTargetWithAddressAndAlias(address, port, alias) {
    const targetName = 'Target ' + nanoid();
    await this.page
      .getByRole('navigation', { name: 'Application local navigation' })
      .getByRole('link', { name: 'Targets' })
      .click();
    await this.page.getByRole('link', { name: 'New', exact: true }).click();
    await this.page.getByLabel('Name').fill(targetName);
    await this.page.getByLabel('Description').fill('This is an automated test');
    await this.page
      .getByRole('group', { name: 'Type' })
      .getByLabel('SSH')
      .click();
    await this.page.getByLabel('Target Address').fill(address);
    await this.page.getByLabel('Default Port').fill(port);
    await this.page
      .getByRole('group', { name: 'Aliases' })
      .getByLabel('value')
      .last()
      .fill(alias);
    await this.page.getByRole('button', { name: 'Add' }).click();

    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(targetName),
    ).toBeVisible();

    return targetName;
  }

  /**
   * Creates a new RDP target.
   * Assumes you have selected the desired project.
   * @param {string} port Port of the target
   * @returns Name of the target
   */
  async createRdpTargetEnt(port) {
    const targetName = 'Target ' + nanoid();
    await this.page
      .getByRole('navigation', { name: 'Application local navigation' })
      .getByRole('link', { name: 'Targets' })
      .click();
    await this.page.getByRole('link', { name: 'New', exact: true }).click();
    await this.page.getByLabel('Name').fill(targetName);
    await this.page.getByLabel('Description').fill('This is an automated test');
    await this.page
      .getByRole('group', { name: 'Type' })
      .getByLabel('RDP')
      .click();
    await this.page.getByLabel('Default Port').fill(port);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(targetName),
    ).toBeVisible();

    return targetName;
  }

  /**
   * Creates a new RDP target with address in boundary-enterprise
   * Assumes you have selected the desired project.
   * @param {string} address Address of the target
   * @param {string} port Port of the target
   * @returns Name of the target
   */
  async createRDPTargetWithAddressEnt(address, port) {
    const targetName = 'Target ' + nanoid();
    await this.page
      .getByRole('navigation', { name: 'Application local navigation' })
      .getByRole('link', { name: 'Targets' })
      .click();
    await this.page.getByRole('link', { name: 'New', exact: true }).click();
    await this.page.getByLabel('Name').fill(targetName);
    await this.page.getByLabel('Description').fill('This is an automated test');
    await this.page
      .getByRole('group', { name: 'Type' })
      .getByLabel('RDP')
      .click();
    await this.page.getByLabel('Target Address').fill(address);
    await this.page.getByLabel('Default Port').fill(port);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(targetName),
    ).toBeVisible();

    return targetName;
  }

  /**
   * Creates a new RDP target with address and alias.
   * Assumes you have selected the desired project.
   * @param {string} address Address of the target
   * @param {string} port Port of the target
   * @param {string} alias alias used for the target
   * @returns Name of the target
   */

  async createRdpTargetWithAddressAndAlias(address, port, alias) {
    const targetName = 'Target ' + nanoid();
    await this.page
      .getByRole('navigation', { name: 'Application local navigation' })
      .getByRole('link', { name: 'Targets' })
      .click();
    await this.page.getByRole('link', { name: 'New', exact: true }).click();
    await this.page.getByLabel('Name').fill(targetName);
    await this.page.getByLabel('Description').fill('This is an automated test');
    await this.page
      .getByRole('group', { name: 'Type' })
      .getByLabel('RDP')
      .click();
    await this.page.getByLabel('Target Address').fill(address);
    await this.page.getByLabel('Default Port').fill(port);
    await this.page
      .getByRole('group', { name: 'Aliases' })
      .getByLabel('value')
      .last()
      .fill(alias);
    await this.page.getByRole('button', { name: 'Add' }).click();

    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(targetName),
    ).toBeVisible();

    return targetName;
  }

  /**
   * Adds a host source to a target. Assume you have selected the desired target.
   * @param {string} hostSourceName Name of host source that will be attached to the target
   */
  async addHostSourceToTarget(hostSourceName) {
    await this.page
      .getByRole('link', { name: 'Host Sources', exact: true })
      .click();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText('Host Sources'),
    ).toBeVisible();

    const emptyLinkIsVisible = await this.page
      .getByRole('link', { name: 'Add Host Sources', exact: true })
      .isVisible();
    if (!emptyLinkIsVisible) {
      await this.page.getByText('Manage').click();
    }
    await this.page
      .getByRole('link', { name: 'Add Host Sources', exact: true })
      .click();

    await this.page
      .getByRole('row')
      .filter({ has: this.page.getByRole('cell', { name: hostSourceName }) })
      .getByRole('checkbox')
      .click({ force: true });
    await this.page.getByRole('button', { name: 'Add Host Sources' }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page.getByRole('link', { name: hostSourceName }),
    ).toBeVisible();
  }

  async removeHostSourceFromTarget(hostSourceName) {
    await this.page
      .getByRole('row')
      .filter({ has: this.page.getByRole('link', { name: hostSourceName }) })
      .getByRole('button', { name: 'Manage' })
      .click();
    await this.page.getByRole('button', { name: 'Remove' }).click();
    await this.page.getByRole('button', { name: 'OK', exact: true }).click();
    await this.dismissSuccessAlert();
  }

  /**
   * Adds an ingress worker filter to a target. Assume you have selected the desired target.
   * @param {string} filter Ingress worker filter to be added to the target
   */
  async addIngressWorkerFilterToTarget(filter) {
    await this.page.getByRole('link', { name: 'Workers', exact: true }).click();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText('Workers'),
    ).toBeVisible();

    await this.page
      .getByText('Ingress workers')
      .locator('..')
      .getByRole('link', { name: 'Add worker filter' })
      .click();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText('Edit Ingress Worker Filter'),
    ).toBeVisible();

    await this.page.locator('.CodeMirror').getByRole('textbox').fill(filter);

    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();
  }

  /**
   * Adds an egress worker filter to a target. Assume you have selected the desired target.
   * @param {string} filter Egress worker filter to be added to the target
   */
  async addEgressWorkerFilterToTarget(filter) {
    await this.page.getByRole('link', { name: 'Workers', exact: true }).click();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText('Workers'),
    ).toBeVisible();

    await this.page
      .getByText('Egress workers')
      .locator('..')
      .getByRole('link', { name: 'Add worker filter' })
      .click();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText('Edit Egress Worker Filter'),
    ).toBeVisible();

    await this.page.locator('.CodeMirror').getByRole('textbox').fill(filter);

    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();
  }

  /**
   * Adds brokered credentials to a target
   * @param {string} targetName Name of the target associated with the session
   * @param {string} credentialName Name of the credentials to be added to the target
   */
  async addBrokeredCredentialsToTarget(targetName, credentialName) {
    await this.page
      .getByRole('navigation', { name: 'Application local navigation' })
      .getByRole('link', { name: 'Targets' })
      .click();
    await expect(
      this.page.getByRole('heading', { name: 'Targets' }),
    ).toBeVisible();
    await this.page.getByRole('link', { name: targetName }).click();
    await this.page
      .getByRole('link', { name: 'Brokered Credentials', exact: true })
      .click();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText('Brokered Credentials'),
    ).toBeVisible();

    const addBrokeredCredentialsButtonIsVisible = await this.page
      .getByRole('link', { name: 'Add Brokered Credentials', exact: true })
      .isVisible();

    if (!addBrokeredCredentialsButtonIsVisible) {
      await this.page.getByText('Manage').click();
    }
    await this.page
      .getByRole('link', { name: 'Add Brokered Credentials', exact: true })
      .click();

    await this.page
      .getByRole('row')
      .filter({ has: this.page.getByRole('cell', { name: credentialName }) })
      .getByRole('checkbox')
      .click({ force: true });
    await this.page
      .getByRole('button', { name: 'Add Brokered Credentials', exact: true })
      .click();
    await this.dismissSuccessAlert();
    await expect(
      this.page.getByRole('link', { name: credentialName }),
    ).toBeVisible();
  }

  /**
   * Adds injected credentials to a target
   * @param {string} targetName Name of the target associated with the session
   * @param {string} credentialName Name of the credentials to be added to the target
   */
  async addInjectedCredentialsToTarget(targetName, credentialName) {
    await this.page
      .getByRole('navigation', { name: 'Application local navigation' })
      .getByRole('link', { name: 'Targets' })
      .click();
    await expect(
      this.page.getByRole('heading', { name: 'Targets' }),
    ).toBeVisible();
    await this.page.getByRole('link', { name: targetName }).click();
    await this.page
      .getByRole('link', {
        name: 'Injected Application Credentials',
        exact: true,
      })
      .click();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText('Injected Application Credentials'),
    ).toBeVisible();

    const addInjectedCredentialsButtonIsVisible = await this.page
      .getByRole('link', {
        name: 'Add Injected Application Credentials',
        exact: true,
      })
      .isVisible();

    if (!addInjectedCredentialsButtonIsVisible) {
      await this.page.getByText('Manage').click();
    }
    await this.page
      .getByRole('link', {
        name: 'Add Injected Application Credentials',
        exact: true,
      })
      .click();

    await this.page
      .getByRole('row')
      .filter({ has: this.page.getByRole('cell', { name: credentialName }) })
      .getByRole('checkbox')
      .click({ force: true });
    await this.page
      .getByRole('button', {
        name: 'Add Injected Application Credentials',
        exact: true,
      })
      .click();
    await this.dismissSuccessAlert();
    await expect(
      this.page.getByRole('link', { name: credentialName }),
    ).toBeVisible();
  }

  /**
   * Enables session recording for a target. Assumes you have selected the desired target.
   * @param {string} storageBucketName name of the Storage Bucket used for session recording
   */
  async enableSessionRecording(storageBucketName) {
    await this.page.getByText('Enable recording').click();
    await this.page.getByLabel('Record sessions for this target').click();
    await this.page
      .getByLabel('Storage buckets')
      .selectOption({ label: storageBucketName });
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page.getByRole('listitem').getByText(storageBucketName),
    ).toBeVisible();
  }

  /**
   * Detaches storage bucket from target. Assumes you have selected the desired target.
   */
  async detachStorageBucket() {
    await this.page
      .getByRole('link', { name: 'Session Recording settings' })
      .click();
    await this.page.getByLabel('Record sessions for this target').uncheck();
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();
  }
}
