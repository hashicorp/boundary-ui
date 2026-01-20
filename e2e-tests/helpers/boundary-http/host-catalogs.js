/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { nanoid } from 'nanoid';
import { checkResponse } from './responseHelper.js';

/**
 * Creates a new static host catalog
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} projectId ID of the project where the catalog will be created
 * @returns {Promise<Serializable>}
 */
export async function createStaticHostCatalog(request, projectId) {
  const response = await request.post(`/v1/host-catalogs`, {
    data: {
      name: `static-host-catalog-${nanoid()}`,
      scope_id: projectId,
      type: 'static',
    },
  });

  return checkResponse(response);
}
