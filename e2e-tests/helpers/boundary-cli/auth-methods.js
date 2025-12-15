/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { execSync } from 'node:child_process';
import { nanoid } from 'nanoid';

/**
 * Creates a new password auth-method
 * @param {string} scopeId ID of the scope under which the auth-method will be created.
 * @returns {Promise<string>} new auth-method's ID
 */
export async function createPasswordAuthMethod(scopeId) {
  const authMethodName = 'auth-method-' + nanoid();
  let newAuthMethod;
  try {
    newAuthMethod = JSON.parse(
      execSync(
        `boundary auth-methods create password \
        -name "${authMethodName}" \
        -scope-id ${scopeId} \
        -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return newAuthMethod.id;
}
