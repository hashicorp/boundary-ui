/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { execSync } from 'node:child_process';
import { nanoid } from 'nanoid';

/**
 * Creates a new static host catalog
 * @param {string} projectId ID of the project under which the host catalog will be created.
 * @returns {Promise<string>} new host catalog's ID
 */
export async function createStaticHostCatalog(projectId) {
  const hostCatalogName = 'static-host-catalog-' + nanoid();
  let hostCatalog;
  try {
    hostCatalog = JSON.parse(
      execSync(
        `boundary host-catalogs create static \
        -scope-id ${projectId} \
        -name ${hostCatalogName} \
        -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return hostCatalog.id;
}

/**
 * Creates a new dynamic AWS host catalog
 * @param {string} projectId ID of the project under which the host catalog will be created.
 * @param {string} region Name of the AWS region that the host catalog will be created for.
 * @returns {Promise<string>} new host catalog's ID
 */
export async function createDynamicAwsHostCatalog(projectId, region) {
  const hostCatalogName = 'dynamic-aws-host-catalog-' + nanoid();
  let hostCatalog;
  try {
    hostCatalog = JSON.parse(
      execSync(
        `boundary host-catalogs create plugin \
        -name ${hostCatalogName} \
        -scope-id ${projectId} \
        -plugin-name aws \
        -attr disable_credential_rotation=true \
        -attr region=${region} \
        -secret access_key_id=env://E2E_AWS_ACCESS_KEY_ID \
        -secret secret_access_key=env://E2E_AWS_SECRET_ACCESS_KEY \
        -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return hostCatalog.id;
}
