/**
 * Copyright IBM Corp. 2024, 2026
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

/**
 * Creates a new vault credential store
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} projectId ID of the project where the credential store will be created
 * @param {string} vaultAddr Address of the vault server
 * @param {string} vaultToken Token for the vault server
 * @returns {Promise<Serializable>}
 */
export async function createVaultCredentialStore(
  request,
  projectId,
  vaultAddr,
  vaultToken,
) {
  const response = await request.post(`/v1/credential-stores`, {
    data: {
      name: `vault-credential-store-${nanoid()}`,
      scope_id: projectId,
      type: 'vault',
      attributes: {
        address: vaultAddr,
        token: vaultToken,
      },
    },
  });

  return checkResponse(response);
}
