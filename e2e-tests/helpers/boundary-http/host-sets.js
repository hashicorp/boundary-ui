/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { nanoid } from 'nanoid';
import { checkResponse } from './responseHelper.js';

/**
 * Creates a host set
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} hostCatalogId ID of the host catalog
 * @returns {Promise<Serializable>}
 */
export async function createHostSet(request, hostCatalogId) {
  const response = await request.post(`/v1/host-sets`, {
    data: {
      name: `static-host-sets-${nanoid()}`,
      host_catalog_id: hostCatalogId,
    },
  });

  return checkResponse(response);
}

/**
 * Adds a host
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {Object} hostSet The host set object
 * @param {string} hostIds ID of the host to add
 * @returns {Promise<Serializable>}
 */
export async function addHostToHostSet(request, { hostSet, hostIds }) {
  const response = await request.post(`/v1/host-sets/${hostSet.id}:add-hosts`, {
    data: {
      host_ids: hostIds,
      version: hostSet.version,
    },
  });

  return checkResponse(response);
}
