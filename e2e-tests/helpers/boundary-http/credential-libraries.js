/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { nanoid } from 'nanoid';
import { checkResponse } from './responseHelper.js';

/**
 * Creates a vault generic credential library
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} credentialStoreId ID of the credential store where the credential will be created
 * @param {string} vaultPath Path to secret in vault
 * @returns {Promise<Serializable>}
 */
export async function createVaultGenericSecretsCredentialLibrary(
  request,
  { credentialStoreId, vaultPath },
) {
  const response = await request.post(`/v1/credential-libraries`, {
    data: {
      name: `vault-credential-store-${nanoid()}`,
      credential_store_id: credentialStoreId,
      type: 'vault-generic',
      attributes: {
        path: vaultPath,
      },
    },
  });

  return checkResponse(response);
}
