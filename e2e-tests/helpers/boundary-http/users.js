/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { nanoid } from 'nanoid';
import { checkResponse } from './responseHelper.js';

/**
 * Create a new user
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} orgId
 * @returns {Promise<Serializable>}
 */
export async function createUser(request, orgId) {
  const response = await request.post(`/v1/users`, {
    data: {
      scope_id: orgId,
      name: `User ${nanoid()}`,
      description: 'Generated via API from automated test',
    },
  });
  return checkResponse(response);
}

/**
 * Add account to user
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} userId
 * @param {string} accountId
 * @param {number} [version=1] // The version must be incremented for subsequent updates to the same resource to prevent concurrency conflicts
 * @returns {Promise<Serializable>}
 */
export async function addAccountToUser(
  request,
  userId,
  accountId,
  version = 1,
) {
  const response = await request.post(`/v1/users/${userId}:add-accounts`, {
    data: {
      account_ids: [accountId],
      version,
    },
  });
  return checkResponse(response);
}
