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
 * @returns ChildProcess representing the result of the command execution
 */
export async function connectToTarget(targetId, sshUser, sshKeyPath) {
  let connect;
  try {
    connect = exec(
      `boundary connect -target-id=${targetId}` +
        ' -exec /usr/bin/ssh --' +
        ` -l ${sshUser}` +
        ` -i ${sshKeyPath}` +
        ' -o UserKnownHostsFile=/dev/null' +
        ' -o StrictHostKeyChecking=no' +
        ' -o IdentitiesOnly=yes' + // forces the use of the provided key
        ' -p {{boundary.port}}' +
        ' {{boundary.ip}}',
    );
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return connect;
}

/**
 * Connects via ssh to the specified target
 * exec is used here to keep the session open
 * @param {string} targetId ID of the target to be connected to
 * @returns ChildProcess representing the result of the command execution
 */
export async function connectSshToTarget(targetId) {
  let connect;
  try {
    connect = exec(
      'boundary connect ssh' +
        ` -target-id=${targetId}` +
        ' --' +
        ' -o UserKnownHostsFile=/dev/null' +
        ' -o StrictHostKeyChecking=no' +
        ' -o IdentitiesOnly=yes', // forces the use of the provided key
    );
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return connect;
}
