/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

exports.authenticatedState = './tests/e2e/artifacts/authenticated-state.json'; // !! move this somewhere else

/**
 * Checks that the provided environment variables are set
 * @param {string[]} envs List of environment variables
 */
exports.checkEnv = async (envs) => {
  let missing = [];
  for (let env in envs) {
    if (!process.env[envs[env]]) {
      missing.push(envs[env]);
    }
  }

  if (missing.length > 0) {
    throw new Error('Missing Environment Variables -- ' + missing);
  }
};
