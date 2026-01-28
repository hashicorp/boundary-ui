/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { execSync } from 'node:child_process';
import { nanoid } from 'nanoid';

/**
 * Creates a new role
 * @param {string} scopeId ID of the scope under which the role will be created.
 * @returns {Promise<string>} new role's ID
 */
export async function createRole(scopeId, { name }) {
  const roleName = name ?? 'role-' + nanoid();
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

export async function deleteRole(id) {
  try {
    execSync(
      `boundary roles delete \
        -id ${id} \
        -format json`,
    );
  } catch (e) {
    console.log(`${e.stderr}`);
  }

  return id;
}

export async function listRoles(scopeId) {
  let roles;
  try {
    roles = JSON.parse(
      execSync(
        `boundary roles list \
        -scope-id ${scopeId} \
        -format json`,
      ),
    );
  } catch (e) {
    console.log(`${e.stderr}`);
  }

  return roles.items;
}
