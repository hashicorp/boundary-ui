/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { execSync } from 'node:child_process';

/**
 * Checks that the vault cli is available
 */
export async function checkVaultCli() {
  try {
    execSync('which vault');
  } catch (e) {
    throw new Error('vault does not exist on the path');
  }
}

/**
 * Generates a vault token to be used to integrate with Boundary
 * @param {string} boundaryPolicyName Name of the boundary policy that's used to create vault token.
 * @param {string} secretPolicyName Name of the secret policy that's used to create vault token.
 * @returns {Promise<string>} Vault Token
 */
export async function getVaultToken(boundaryPolicyName, secretPolicyName) {
  let clientToken;
  try {
    execSync(
      `vault policy write ${boundaryPolicyName} ./tests/e2e/tests/fixtures/boundary-controller-policy.hcl`,
    );
    execSync(
      `vault policy write ${secretPolicyName} ./tests/e2e/tests/fixtures/kv-policy.hcl`,
    );
    const vaultToken = JSON.parse(
      execSync(
        `vault token create \
          -no-default-policy=true \
          -policy=${boundaryPolicyName} \
          -policy=${secretPolicyName} \
          -orphan=true \
          -period=20m \
          -renewable=true \
          -format=json`,
      ),
    );
    clientToken = vaultToken.auth.client_token;
  } catch (e) {
    console.log(`${e.stderr}`);
  }

  return clientToken;
}
