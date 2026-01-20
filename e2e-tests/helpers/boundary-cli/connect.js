/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { spawn } from 'node:child_process';

const remoteCommand =
  'for i in {1..15}; do echo helloworld\\$i; sleep 1s; done';

/**
 * Spawns a child process for a Boundary connection and returns a promise.
 * Resolves on any output from stdout or stderr.
 * @param {string} command
 * @param {Array<string>} args
 */
async function spawnConnection(command, args) {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args, {
      shell: true,
    });
    childProcess.stdout.on('data', (data) => {
      if (data.toString().includes('helloworld3')) {
        resolve({ childProcess, stdout: data.toString() });
      }
    });
    childProcess.stderr.on('data', (data) => {
      if (!data.toString().includes('Warning: Permanently added')) {
        reject(data.toString());
      }
    });
    childProcess.on('error', (err) => {
      reject(err);
    });

    // In case the process has no stdio and didn't error out, resolve a
    // promise once the child process closes so we're not waiting forever.
    // Windows doesn't seem to return any error nor any output from stderr when
    // a timeout occurs so this guarantees we return a response to the caller.
    // Otherwise this should not get hit as we should be returning a response
    // from one of the handlers above.
    childProcess.on('close', () => {
      resolve({
        childProcess,
        stderr: JSON.stringify({ error: 'Process was closed.' }),
      });
    });
  });
}

/**
 * Connects to the specified target
 * exec is used here to keep the session open
 * @param {string} targetId ID of the target to be connected to
 * @param {string} sshUser User to be used for the ssh connection
 * @param {string} sshKeyPath Path to the ssh key to be used for the ssh connection
 * @returns ChildProcess representing the result of the command execution
 */
export async function connectToTarget(targetId, sshUser, sshKeyPath) {
  try {
    const { childProcess } = await spawnConnection('boundary', [
      'connect',
      `-target-id=${targetId}`,
      '-exec',
      '/usr/bin/ssh',
      '--',
      '-T', // forces tty allocation
      `-l ${sshUser}`,
      `-i ${sshKeyPath}`,
      '-o UserKnownHostsFile=/dev/null',
      '-o StrictHostKeyChecking=no',
      '-o IdentitiesOnly=yes', // forces the use of the provided key
      '-p {{boundary.port}}',
      '{{boundary.ip}}',
      `"${remoteCommand}"`,
    ]);

    return childProcess;
  } catch (e) {
    throw new Error(`Failed to connect to the target: ${e}`);
  }
}

/**
 * Connects to the specified alias
 * exec is used here to keep the session open
 * @param {string} alias alias of the target to be connected to
 * @param {string} sshUser User to be used for the ssh connection
 * @param {string} sshKeyPath Path to the ssh key to be used for the ssh connection
 * @returns ChildProcess representing the result of the command execution
 */
export async function connectToAlias(alias, sshUser, sshKeyPath) {
  try {
    const { childProcess } = await spawnConnection('boundary', [
      'connect',
      `${alias}`,
      '-exec',
      '/usr/bin/ssh',
      '--',
      '-T', // forces tty allocation
      `-l ${sshUser}`,
      `-i ${sshKeyPath}`,
      '-o UserKnownHostsFile=/dev/null',
      '-o StrictHostKeyChecking=no',
      '-o IdentitiesOnly=yes', // forces the use of the provided key
      '-p {{boundary.port}}',
      '{{boundary.ip}}',
      `"${remoteCommand}"`,
    ]);

    return childProcess;
  } catch (e) {
    throw new Error(`Failed to connect to the target: ${e}`);
  }
}

/**
 * Connects via ssh to the specified target
 * exec is used here to keep the session open
 * @param {string} targetId ID of the target to be connected to
 * @returns ChildProcess representing the result of the command execution
 */
export async function connectSshToTarget(targetId) {
  try {
    const { childProcess } = await spawnConnection('boundary', [
      'connect',
      'ssh',
      `-target-id=${targetId}`,
      `-remote-command="${remoteCommand}"`,
      '--',
      '-T', // forces tty allocation
      '-o UserKnownHostsFile=/dev/null',
      '-o StrictHostKeyChecking=no',
      '-o IdentitiesOnly=yes', // forces the use of the provided key
    ]);

    return childProcess;
  } catch (e) {
    throw new Error(`Failed to connect to the target: ${e}`);
  }
}

/**
 * Connects via ssh to the specified alias
 * exec is used here to keep the session open
 * @param {string} alias alias of the target to be connected to
 * @returns ChildProcess representing the result of the command execution
 */
export async function connectSshToAlias(alias) {
  try {
    const { childProcess } = await spawnConnection('boundary', [
      'connect',
      `ssh`,
      `${alias}`,
      `-remote-command="${remoteCommand}"`,
      '--',
      '-T', // forces tty allocation
      '-o UserKnownHostsFile=/dev/null',
      '-o StrictHostKeyChecking=no',
      '-o IdentitiesOnly=yes', // forces the use of the provided key
    ]);

    return childProcess;
  } catch (e) {
    throw new Error(`Failed to connect to the target: ${e}`);
  }
}
