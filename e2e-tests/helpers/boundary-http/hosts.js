/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { nanoid } from 'nanoid';
import { checkResponse } from './responseHelper.js';

/**
 * Creates a host
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} hostCatalogId ID of the host catalog
 * @param {string} name Optional name of the host
 * @param {string} address Address of the host
 * @returns {Promise<Serializable>}
 */
export async function createHost(request, { hostCatalogId, name, address }) {
  const response = await request.post(`/v1/hosts`, {
    data: {
      name: name ?? `static-host-${nanoid()}`,
      host_catalog_id: hostCatalogId,
      type: 'static',
      attributes: {
        address: address,
      },
    },
  });

  return checkResponse(response);
}
