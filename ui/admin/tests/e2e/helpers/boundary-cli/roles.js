/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

const { execSync } = require('child_process');
const { nanoid } = require('nanoid');

/**
 * Creates a new role
 * @param {string} scopeId ID of the scope under which the role will be created.
 * @returns {Promise<string>} new role's ID
 */
export async function createRoleCli(scopeId) {
  const roleName = 'role-' + nanoid();
  let role;
  try {
    role = JSON.parse(
      execSync(
        `boundary roles create \
        -scope-id ${scopeId} \
        -name ${roleName} \
        -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return role.id;
}
