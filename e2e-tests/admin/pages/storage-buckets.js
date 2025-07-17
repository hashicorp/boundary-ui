/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect } from '@playwright/test';
import { nanoid } from 'nanoid';

import { BaseResourcePage } from './base-resource.js';

export class StorageBucketsPage extends BaseResourcePage {
  /**
   * Creates a new AWS Storage Bucket.
   * @param {string} scope Scope of the Storage Bucket
   * @param {string} bucketName Name of the Storage Bucket
   * @param {string} region Region of the Storage Bucket
   * @param {string} accessKeyId Access Key ID for the Storage Bucket
   * @param {string} secretAccessKey Secret Access Key for the Storage Bucket
   * @param {string} workerFilter Worker filter for the Storage Bucket
   * @returns Name of the Storage Bucket
   */
  async createStorageBucketAws(
    scope,
    bucketName,
    region,
    accessKeyId,
    secretAccessKey,
    workerFilter,
  ) {
    const storageBucketName = 'Bucket ' + nanoid();
    await this.page
      .getByRole('link', { name: 'Storage Buckets', exact: true })
      .click();
    await this.page
      .getByRole('link', { name: 'New Storage Bucket', exact: true })
      .click();
    await this.page.getByLabel('Name (Optional)').fill(storageBucketName);
    await this.page.getByLabel('Scope').selectOption({ label: scope });
    await this.page
      .getByRole('group', { name: 'Provider' })
      .getByLabel('Amazon S3')
      .click();
    await this.page.getByLabel('Bucket name').fill(bucketName);
    await this.page.getByLabel('Region').fill(region);
    await this.page.getByLabel('Access key ID').fill(accessKeyId);
    await this.page.getByLabel('Secret access key').fill(secretAccessKey);
    await this.page
      .getByLabel('Worker filter')
      .getByRole('textbox')
      .fill(workerFilter);
    await this.page.getByLabel('Disable credential rotation').click();
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(storageBucketName),
    ).toBeVisible();

    return storageBucketName;
  }

  /**
   * Creates a new MinIO Storage Bucket.
   * @param {string} scope Scope of the Storage Bucket
   * @param {string} endpointUrl Endpoint URL of the Storage Bucket
   * @param {string} bucketName Name of the Storage Bucket
   * @param {string} region Region of the Storage Bucket
   * @param {string} accessKeyId Access Key ID for the Storage Bucket
   * @param {string} secretAccessKey Secret Access Key for the Storage Bucket
   * @param {string} workerFilter Worker filter for the Storage Bucket
   * @returns Name of the Storage Bucket
   */
  async createStorageBucketMinio(
    scope,
    endpointUrl,
    bucketName,
    region,
    accessKeyId,
    secretAccessKey,
    workerFilter,
  ) {
    const storageBucketName = 'Bucket ' + nanoid();
    await this.page
      .getByRole('link', { name: 'Storage Buckets', exact: true })
      .click();
    await this.page
      .getByRole('link', { name: 'New Storage Bucket', exact: true })
      .click();
    await this.page.getByLabel('Name (Optional)').fill(storageBucketName);
    await this.page.getByLabel('Scope').selectOption({ label: scope });
    await this.page
      .getByRole('group', { name: 'Provider' })
      .getByLabel('MinIO')
      .click();
    await this.page.getByLabel('Endpoint URL').fill(endpointUrl);
    await this.page.getByLabel('Bucket name').fill(bucketName);
    await this.page.getByLabel('Region').fill(region);
    await this.page.getByLabel('Access key ID').fill(accessKeyId);
    await this.page.getByLabel('Secret access key').fill(secretAccessKey);
    await this.page
      .getByLabel('Worker filter')
      .getByRole('textbox')
      .fill(workerFilter);
    await this.page.getByLabel('Disable credential rotation').click();
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.dismissSuccessAlert();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText(storageBucketName),
    ).toBeVisible();

    return storageBucketName;
  }
}
