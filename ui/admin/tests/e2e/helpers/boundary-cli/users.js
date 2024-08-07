/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

const { execSync } = require('child_process');
const { nanoid } = require('nanoid');

/**
 * Creates a new user.
 * @param {string} scopeId ID of the scope under which the user will be created.
 * @returns {Promise<string>} new user's ID
 */
export async function createUserCli(scopeId) {
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
