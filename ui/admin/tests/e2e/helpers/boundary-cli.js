/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

/* eslint-disable no-undef */
const { execSync, exec } = require('child_process');

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

/**
 * Uses the boundary CLI to connect to the specified target
 * @param {string} targetId ID of the target to be connected to
 * @returns ChildProcess representing the result of the command execution
 */
exports.connectToTarget = async (targetId) => {
  let connect;
  try {
    connect = exec(
      'boundary connect' +
        ' -target-id=' +
        targetId +
        ' -exec /usr/bin/ssh --' +
        ' -l ' +
        process.env.E2E_SSH_USER +
        ' -i ' +
        process.env.E2E_SSH_KEY_PATH +
        ' -o UserKnownHostsFile=/dev/null' +
        ' -o StrictHostKeyChecking=no' +
        ' -o IdentitiesOnly=yes' + // forces the use of the provided key
        ' -p {{boundary.port}}' +
        ' {{boundary.ip}}'
    );
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return connect;
};

/**
 * Uses the boundary CLI to delete the specified organization
 * @param {string} orgId ID of the organization to be deleted
 */
exports.deleteOrg = async (orgId) => {
  try {
    exec('boundary scopes delete -id=' + orgId);
  } catch (e) {
    console.log(`${e.stderr}`);
  }
};
