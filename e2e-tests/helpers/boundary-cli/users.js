/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { execSync } from 'node:child_process';
import { nanoid } from 'nanoid';

/**
 * Creates a new user.
 * @param {string} scopeId ID of the scope under which the user will be created.
 * @returns {Promise<string>} new user's ID
 */
export async function createUser(scopeId) {
  const userName = 'user-' + nanoid();
  let user;
  try {
    user = JSON.parse(
      execSync(
        `boundary users create \
        -scope-id ${scopeId} \
        -name ${userName} \
        -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return user.id;
}
