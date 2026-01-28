/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { execSync } from 'node:child_process';
import { nanoid } from 'nanoid';

/**
 * Creates a TCP target.
 * @param {string} projectId ID of the project under which the target will be created.
 * @returns {Promise<string>} new target's ID
 */
export async function createTcpTarget(projectId) {
  const targetName = 'target-' + nanoid();
  const defaultPort = 22;
  let target;
  try {
    target = JSON.parse(
      execSync(
        `boundary targets create tcp \
        -default-port ${defaultPort} \
        -name ${targetName} \
        -scope-id ${projectId} \
        -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return target.id;
}

/**
 * Creates a SSH target
 * @param {string} projectId ID of the project under which the target will be created.
 * @returns {Promise<string>} new target's ID
 */
export async function createSshTarget(projectId) {
  const targetName = 'target-' + nanoid();
  const defaultPort = 22;
  let target;
  try {
    target = JSON.parse(
      execSync(
        `boundary targets create ssh \
        -default-port ${defaultPort} \
        -name ${targetName} \
        -scope-id ${projectId} \
        -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return target.id;
}

/**
 * Authorizes a session given an alias
 * @param {string} alias alias of the target to be connected to
 * @returns Session information
 */
export async function authorizeSessionByAlias(alias) {
  let session;
  try {
    session = JSON.parse(
      execSync(`boundary targets authorize-session ${alias} -format json`),
    );
  } catch (e) {
    throw new Error(`Failed to connect to alias: ${e.stderr}`);
  }
  return session;
}

/**
 * Authorizes a session given a target id
 * @param {string} targetId Id of the target to be connected to
 * @returns Session information
 */
export async function authorizeSessionByTargetId(targetId) {
  let session;
  try {
    session = JSON.parse(
      execSync(
        `boundary targets authorize-session -id ${targetId} -format json`,
      ),
    );
  } catch (e) {
    throw new Error(`Failed to connect to target: ${e.stderr}`);
  }
  return session;
}

/**
 * Gets Target ID from Target Name
 * @param {string} projectId ID of the project under which the target exists
 * @param {string} targetName Name of the target
 * @returns {Promise<string>} ID of the target
 */
export async function getTargetIdFromName(projectId, targetName) {
  const targets = JSON.parse(
    execSync(`boundary targets list -scope-id ${projectId} -format json`),
  );
  const target = targets.items.filter((obj) => obj.name == targetName)[0];
  if (target) {
    return target.id;
  }
  return null;
}
