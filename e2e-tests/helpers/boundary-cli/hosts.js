/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { execSync } from 'node:child_process';
import { nanoid } from 'nanoid';

/**
 * Creates a new static host
 * @param {string} hostCatalogId ID of the host catalog that the host will be created for.
 * @returns {Promise<string>} new host's ID
 */
export async function createStaticHost(hostCatalogId) {
  const hostName = 'static-host-' + nanoid();
  let host;
  try {
    host = JSON.parse(
      execSync(
        `boundary hosts create static \
        -host-catalog-id ${hostCatalogId} \
        -name ${hostName} \
        -address localhost \
        -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return host.id;
}
