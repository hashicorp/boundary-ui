/**
 * Copyright IBM Corp. 2021, 2025
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
 * @returns {Promise<Serializable>}
 */
export async function addAccountsToUser(request, { user, accountIds }) {
  const response = await request.post(`/v1/users/${user.id}:add-accounts`, {
    data: {
      account_ids: accountIds,
      version: user.version,
    },
  });
  return checkResponse(response);
}
