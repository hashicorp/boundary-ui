/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

/* eslint-disable no-undef */
exports.authenticatedState = './tests/e2e/artifacts/authenticated-state.json';

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
