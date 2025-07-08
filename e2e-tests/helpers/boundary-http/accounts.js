/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { nanoid } from 'nanoid';
import { checkResponse } from './responseHelper.js';

/**
 * Creates a new password auth account
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} authMethodId
 * @param {string} username
 * @param {string} password
 * @returns {Promise<Serializable>}
 */
export async function createPasswordAccount(
  request,
  authMethodId,
  username,
  password,
) {
  const response = await request.post(`/v1/accounts`, {
    data: {
      attributes: {
        login_name: username,
        password: password,
      },
      auth_method_id: authMethodId,
      description: 'Generated via API from automated test',
      name: `Account ${nanoid()}`,
      type: 'password',
    },
  });
  return checkResponse(response);
}
