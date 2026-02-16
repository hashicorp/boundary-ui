/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { execSync } from 'node:child_process';

/**
 * Creates a new password account
 * @param {string} authMethodId ID of the auth-method that the new account will be created for.
 * @returns {Promise<string>} new account's ID
 */
export async function createPasswordAccount(authMethodId) {
  let passwordAccount;
  const login = 'test-login';
  try {
    passwordAccount = JSON.parse(
      execSync(
        `boundary accounts create password \
        -auth-method-id ${authMethodId} \
        -login-name ${login} \
        -password env://ACCOUNT_PASSWORD \
        -format json`,
        { env: { ...process.env, ACCOUNT_PASSWORD: 'test-password' } },
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return passwordAccount.id;
}
