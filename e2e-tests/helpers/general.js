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

/**
 * Checks if a controller address is an AWS controller by examining the hostname for 'amazonaws.com'
 * @param {*} controllerAddr
 * @returns
 */
export async function isAwsController(controllerAddr) {
  try {
    const { hostname } = new URL(controllerAddr);
    return hostname === 'amazonaws.com' || hostname.endsWith('.amazonaws.com');
  } catch {
    // If the URL is invalid, treat it as non-AWS.
    return false;
  }
}
