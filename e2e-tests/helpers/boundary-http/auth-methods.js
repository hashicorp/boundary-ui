/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { nanoid } from 'nanoid';
import { checkResponse } from './responseHelper.js';

/**
 * Creates a new auth method
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} orgId
 * @returns {Promise<Serializable>}
 */
export async function createPasswordAuthMethod(request, orgId) {
  const response = await request.post(`/v1/auth-methods`, {
    data: {
      scope_id: orgId,
      name: `Auth Method ${nanoid()}`,
      description: 'Generated via API from automated test',
      type: 'password',
    },
  });
  return checkResponse(response);
}

/**
 * Deletes an auth method
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} authMethodId
 * @returns {Promise<Serializable>}
 */
export async function deleteAuthMethod(request, authMethodId) {
  const response = await request.delete(`/v1/auth-methods/${authMethodId}`);
  return checkResponse(response, true);
}
