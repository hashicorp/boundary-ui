/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { execSync } from 'node:child_process';

/**
 * Deletes the specified policy
 * @param {string} policyId ID of the policy to be deleted
 */
export async function deletePolicy(policyId) {
  try {
    execSync('boundary policies delete -id=' + policyId);
  } catch (e) {
    console.log(`${e.stderr}`);
  }
}

/**
 * Gets Policy ID from Policy Name
 * @param {string} scopeId Id of the scope under which the policy exists
 * @param {string} policyName Name of the policy
 * @returns {Promise<string>} ID of the policy
 */
export async function getPolicyIdFromName(scopeId, policyName) {
  const policies = JSON.parse(
    execSync(`boundary policies list -scope-id ${scopeId} -format json`),
  );
  const policy = policies.items.filter((obj) => obj.name == policyName)[0];
  if (policy) {
    return policy.id;
  }
  return null;
}
