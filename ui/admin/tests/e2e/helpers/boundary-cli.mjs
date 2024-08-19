/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { execSync } from 'node:child_process';

export * from './boundary-cli/accounts.mjs';
export * from './boundary-cli/aliases.mjs';
export * from './boundary-cli/auth-methods.mjs';
export * from './boundary-cli/authenticate.mjs';
export * from './boundary-cli/connect.mjs';
export * from './boundary-cli/credential-stores.mjs';
export * from './boundary-cli/credentials.mjs';
export * from './boundary-cli/groups.mjs';
export * from './boundary-cli/host-catalogs.mjs';
export * from './boundary-cli/host-sets.mjs';
export * from './boundary-cli/hosts.mjs';
export * from './boundary-cli/policies.mjs';
export * from './boundary-cli/roles.mjs';
export * from './boundary-cli/scopes.mjs';
export * from './boundary-cli/session-recordings.mjs';
export * from './boundary-cli/storage-buckets.mjs';
export * from './boundary-cli/targets.mjs';
export * from './boundary-cli/users.mjs';
export * from './boundary-cli/workers.mjs';

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
