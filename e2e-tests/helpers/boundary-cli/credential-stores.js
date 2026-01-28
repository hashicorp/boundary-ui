/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { execSync } from 'node:child_process';
import { nanoid } from 'nanoid';

/**
 * Creates a new static credential store
 * @param {string} projectId ID of the project under which the credential store will be created.
 * @returns {Promise<string>} new credential store's ID
 */
export async function createStaticCredentialStore(projectId) {
  const credentialStoreName = 'static-credential-store-' + nanoid();
  let staticCredentialStore;
  try {
    staticCredentialStore = JSON.parse(
      execSync(
        `boundary credential-stores create static \
        -scope-id ${projectId} \
        -name ${credentialStoreName} \
        -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return staticCredentialStore.id;
}

/**
 * Creates a new vault credential store
 * @param {string} projectId ID of the project under which the credential store will be created.
 * @param {string} vaultAddr Address of the vault that the credential store will be created for.
 * @param {string} vaultToken Token for Boundary to authenticate with Vault
 * @returns {Promise<string>} new credential store's ID
 */
export async function createVaultCredentialStore(
  projectId,
  vaultAddr,
  vaultToken,
) {
  let credentialStore;
  try {
    const credentialStoreName = 'vault-credential-store-' + nanoid();
    credentialStore = JSON.parse(
      execSync(
        `boundary credential-stores create vault \
          -scope-id ${projectId} \
          -name ${credentialStoreName} \
          -vault-address ${vaultAddr} \
          -vault-token ${vaultToken} \
          -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return credentialStore.id;
}
