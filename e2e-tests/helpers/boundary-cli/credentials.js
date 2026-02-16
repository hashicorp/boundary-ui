/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { execSync } from 'node:child_process';

/**
 * Creates a new username-password credential
 * @param {string} credentialStoreId ID of the credential store that the credential will be created for.
 * @returns {Promise<string>} new credential's ID
 */
export async function createUsernamePasswordCredential(credentialStoreId) {
  let usernamePasswordCredential;
  const login = 'test-login';
  try {
    usernamePasswordCredential = JSON.parse(
      execSync(
        `boundary credentials create username-password \
        -name ${login} \
        -credential-store-id ${credentialStoreId} \
        -username ${login} \
        -password env://CREDENTIALS_PASSWORD \
        -format json`,
        {
          env: { ...process.env, CREDENTIALS_PASSWORD: 'credentials-password' },
        },
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return usernamePasswordCredential.id;
}
