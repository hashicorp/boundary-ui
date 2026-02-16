/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { execSync } from 'node:child_process';

/**
 * Authenticates to the specified Boundary instance
 * @param {string} addr Address of the Boundary instance to be authenticated to
 * @param {string} authMethodId ID of the auth method to be used for authentication
 * @param {string} loginName Login name to be used for authentication
 * @param {string} password Password to be used for authentication
 */
export async function authenticateBoundary(
  addr,
  authMethodId,
  loginName,
  password,
) {
  try {
    execSync(
      'boundary authenticate password' +
        ` -addr=${addr}` +
        ` -auth-method-id=${authMethodId}` +
        ` -login-name=${loginName}` +
        ' -password=env://BPASS',
      { env: { ...process.env, BPASS: password } },
    );
  } catch (e) {
    console.log(`${e.stderr}`);
  }
}
