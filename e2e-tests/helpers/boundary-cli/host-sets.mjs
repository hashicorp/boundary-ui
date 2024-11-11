/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { execSync } from 'node:child_process';
import { nanoid } from 'nanoid';

/**
 * Creates a new static host set
 * @param {string} hostCatalogId ID of the host catalog that the host set will be created for.
 * @returns {Promise<string>} new host set's ID
 */
export async function createHostSetCli(hostCatalogId) {
  const hostSetName = 'static-host-' + nanoid();
  let hostSet;
  try {
    hostSet = JSON.parse(
      execSync(
        `boundary host-sets create static \
        -host-catalog-id ${hostCatalogId} \
        -name ${hostSetName} \
        -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return hostSet.id;
}
