/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

const { execSync } = require('child_process');

/**
 * Checks that the vault cli is available
 */
exports.checkVaultCli = async () => {
  try {
    execSync('which vault');
  } catch (e) {
    throw new Error('vault does not exist on the path');
  }
};
