/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { execSync } from 'node:child_process';

export * from './boundary-cli/accounts.js';
export * from './boundary-cli/aliases';
export * from './boundary-cli/auth-methods';
export * from './boundary-cli/authenticate';
export * from './boundary-cli/connect';
export * from './boundary-cli/credential-stores';
export * from './boundary-cli/credentials';
export * from './boundary-cli/groups';
export * from './boundary-cli/host-catalogs';
export * from './boundary-cli/host-sets';
export * from './boundary-cli/hosts';
export * from './boundary-cli/policies';
export * from './boundary-cli/roles';
export * from './boundary-cli/scopes';
export * from './boundary-cli/session-recordings';
export * from './boundary-cli/storage-buckets';
export * from './boundary-cli/targets';
export * from './boundary-cli/users';
export * from './boundary-cli/workers';

/**
 * Checks that the boundary cli is available
 */
export async function checkBoundaryCli() {
  try {
    execSync('which boundary');
  } catch (e) {
    throw new Error('boundary does not exist on the path');
  }
}
