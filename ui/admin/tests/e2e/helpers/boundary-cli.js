/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

/* eslint-disable no-undef */
const { execSync } = require('child_process');

/**
 * Checks that the boundary cli is available
 */
exports.checkBoundaryCli = async () => {
  try {
    execSync('which boundary');
  } catch (e) {
    throw new Error('boundary does not exist on the path');
  }
};

/**
 * Uses the boundary CLI to authenticate to the specified Boundary instance
 */
exports.authenticateBoundaryCli = async () => {
  try {
    execSync(
      'boundary authenticate password' +
        ' -addr=' +
        process.env.BOUNDARY_ADDR +
        ' -auth-method-id=' +
        process.env.E2E_PASSWORD_AUTH_METHOD_ID +
        ' -login-name=' +
        process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME +
        ' -password=env://E2E_PASSWORD_ADMIN_PASSWORD'
    );
  } catch (e) {
    console.log(`${e.stderr}`);
  }
};
