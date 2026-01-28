/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { execSync } from 'node:child_process';
import { nanoid } from 'nanoid';

/**
 * Creates a new group
 * @param {string} scopeId ID of the scope under which the group will be created.
 * @returns {Promise<string>} new group's ID
 */
export async function createGroup(scopeId) {
  const groupName = 'group-' + nanoid();
  let group;
  try {
    group = JSON.parse(
      execSync(
        `boundary groups create \
        -scope-id ${scopeId} \
        -name ${groupName} \
        -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return group.id;
}
