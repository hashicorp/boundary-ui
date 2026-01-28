/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { execSync } from 'node:child_process';

export * from './boundary-cli/accounts.js';
export * from './boundary-cli/aliases.js';
export * from './boundary-cli/auth-methods.js';
export * from './boundary-cli/authenticate.js';
export * from './boundary-cli/connect.js';
export * from './boundary-cli/credential-stores.js';
export * from './boundary-cli/credentials.js';
export * from './boundary-cli/groups.js';
export * from './boundary-cli/host-catalogs.js';
export * from './boundary-cli/host-sets.js';
export * from './boundary-cli/hosts.js';
export * from './boundary-cli/policies.js';
export * from './boundary-cli/roles.js';
export * from './boundary-cli/scopes.js';
export * from './boundary-cli/session-recordings.js';
export * from './boundary-cli/storage-buckets.js';
export * from './boundary-cli/targets.js';
export * from './boundary-cli/users.js';
export * from './boundary-cli/workers.js';

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
