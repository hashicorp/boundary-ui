/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

const { execSync } = require('child_process');
const { nanoid } = require('nanoid');

/**
 * Creates a new password auth-method
 * @param {string} scopeId ID of the scope under which the auth-method will be created.
 * @returns {Promise<string>} new auth-method's ID
 */
export async function createPasswordAuthMethodCli(scopeId) {
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
