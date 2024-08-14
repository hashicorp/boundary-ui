/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

const { execSync } = require('child_process');
const { nanoid } = require('nanoid');

/**
 * Creates a new static host
 * @param {string} hostCatalogId ID of the host catalog that the host will be created for.
 * @returns {Promise<string>} new host's ID
 */
export async function createStaticHostCli(hostCatalogId) {
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
