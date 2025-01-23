/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { nanoid } from 'nanoid';
import { checkResponse } from './responseHelper.js';
import { readFile } from 'fs/promises';

/**
 * Creates a new ssh keypair credential
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} credentialStoreId ID of the credential store where the credential will be created
 * @param {string} username Username of the user credential
 * @param {string} sshKeyPath Path to private key of the user credential
 * @returns {Promise<Serializable>}
 */
export async function createStaticCredentialKeyPair(
  request,
  { credentialStoreId, username, sshKeyPath },
) {
  const privateKey = await readFile(sshKeyPath, {
    encoding: 'utf-8',
  });

  const response = await request.post(`/v1/credentials`, {
    data: {
      name: `static-credential-store-${nanoid()}`,
      credential_store_id: credentialStoreId,
      type: 'ssh_private_key',
      attributes: {
        username,
        private_key: privateKey,
      },
    },
  });

  return checkResponse(response);
}
