/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

/**
 * Checks that the provided environment variables are set
 * @param {string[]} envs List of environment variables
 */
export async function checkEnv(envs) {
  let missing = [];
  for (let env in envs) {
    if (!process.env[envs[env]]) {
      missing.push(envs[env]);
    }
  }

  if (missing.length > 0) {
    throw new Error('Missing Environment Variables -- ' + missing);
  }
}
