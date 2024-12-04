/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { nanoid } from 'nanoid';
import { checkResponse } from './responseHelper.js';

/**
 * Creates a new static credential store
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} projectId ID of the project where the credential store will be created
 * @returns {Promise<Serializable>}
 */
export async function createStaticCredentialStore(request, projectId) {
  const response = await request.post(`/v1/credential-stores`, {
    data: {
      name: `static-credential-store-${nanoid()}`,
      scope_id: projectId,
      type: 'static',
    },
  });

  return checkResponse(response);
}
