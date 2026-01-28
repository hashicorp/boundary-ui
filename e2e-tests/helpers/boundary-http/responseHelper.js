/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

/**
 * Check if the response is OK
 * @param {import('@playwright/test').APIResponse} response
 * @param {boolean=} isResponseEmpty
 * @return {Promise<Serializable>|void}
 */
export async function checkResponse(response, isResponseEmpty) {
  if (!response.ok()) {
    throw new Error(
      `Request failed with ${response.status()}: ${await response.text()}`,
    );
  }

  if (isResponseEmpty) {
    return;
  }
  return await response.json();
}
