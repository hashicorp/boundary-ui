/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { exec } from 'node:child_process';

/**
 * Connects to the specified target
 * exec is used here to keep the session open
 * @param {string} targetId ID of the target to be connected to
 * @param {string} sshUser User to be used for the ssh connection
 * @param {string} sshKeyPath Path to the ssh key to be used for the ssh connection
 * @param {boolean} ignoreErrors (Optional) boolean to ignore errors
 * @returns ChildProcess representing the result of the command execution
 */
export async function connectToTarget(
  targetId,
  sshUser,
  sshKeyPath,
  ignoreErrors = false,
) {
  let connect = exec(
    `boundary connect -target-id=${targetId}` +
      ' -exec /usr/bin/ssh --' +
      ' -T' + // forces tty allocation
      ` -l ${sshUser}` +
      ` -i ${sshKeyPath}` +
      ' -o UserKnownHostsFile=/dev/null' +
      ' -o StrictHostKeyChecking=no' +
      ' -o IdentitiesOnly=yes' + // forces the use of the provided key
      ' -p {{boundary.port}}' +
      ' {{boundary.ip}}',
    (error) => {
      if (error.killed !== true && !ignoreErrors) {
        throw new Error(`Failed to connect to the target: ${error}`);
      }
    },
  );
  return connect;
}

/**
 * Connects to the specified alias
 * exec is used here to keep the session open
 * @param {string} alias alias of the target to be connected to
 * @param {string} sshUser User to be used for the ssh connection
 * @param {string} sshKeyPath Path to the ssh key to be used for the ssh connection
 * @param {boolean} ignoreErrors (Optional) boolean to ignore errors
 * @returns ChildProcess representing the result of the command execution
 */
export async function connectToAlias(
  alias,
  sshUser,
  sshKeyPath,
  ignoreErrors = false,
) {
  let connect = exec(
    `boundary connect ${alias}` +
      ' -exec /usr/bin/ssh --' +
      ' -T' + // forces tty allocation
      ` -l ${sshUser}` +
      ` -i ${sshKeyPath}` +
      ' -o UserKnownHostsFile=/dev/null' +
      ' -o StrictHostKeyChecking=no' +
      ' -o IdentitiesOnly=yes' + // forces the use of the provided key
      ' -p {{boundary.port}}' +
      ' {{boundary.ip}}',
    (error) => {
      if (error.killed !== true && !ignoreErrors) {
        throw new Error(`Failed to connect to the target: ${error}`);
      }
    },
  );
  return connect;
}

/**
 * Connects via ssh to the specified target
 * exec is used here to keep the session open
 * @param {string} targetId ID of the target to be connected to
 * @param {boolean} ignoreErrors (Optional) boolean to ignore errors
 * @returns ChildProcess representing the result of the command execution
 */
export async function connectSshToTarget(targetId, ignoreErrors = false) {
  let connect = exec(
    'boundary connect ssh' +
      ` -target-id=${targetId}` +
      ' --' +
      ' -T' + // forces tty allocation
      ' -o UserKnownHostsFile=/dev/null' +
      ' -o StrictHostKeyChecking=no' +
      ' -o IdentitiesOnly=yes', // forces the use of the provided key
    (error) => {
      if (error.killed !== true && !ignoreErrors) {
        throw new Error(`Failed to connect to the target: ${error}`);
      }
    },
  );
  return connect;
}

/**
 * Connects via ssh to the specified alias
 * exec is used here to keep the session open
 * @param {string} alias alias of the target to be connected to
 * @returns ChildProcess representing the result of the command execution
 */
export async function connectSshToAlias(alias) {
  let connect = exec(
    'boundary connect ssh' +
      ` ${alias}` +
      ' --' +
      ' -T' + // forces tty allocation
      ' -o UserKnownHostsFile=/dev/null' +
      ' -o StrictHostKeyChecking=no' +
      ' -o IdentitiesOnly=yes', // forces the use of the provided key
    (error) => {
      if (error.killed !== true) {
        throw new Error(`Failed to connect to the target: ${error}`);
      }
    },
  );
  return connect;
}
