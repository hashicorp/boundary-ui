/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { nanoid } from 'nanoid';
import { checkResponse } from './responseHelper.js';

/**
 * Creates a new target
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} scopeId ID of the scope where target will be created
 * @param {string} type type of the target: 'tcp, 'ssh'
 * @param {number} port default port of the target
 * @param {string} address Optional target address
 * @returns {Promise<Serializable>}
 */
export async function createTarget(request, { scopeId, type, port, address }) {
  const response = await request.post(`/v1/targets`, {
    data: {
      name: `Target-${nanoid()}`,
      scope_id: scopeId,
      type: type,
      attributes: {
        default_port: port,
      },
      address,
    },
  });

  return checkResponse(response);
}

/**
 * Adds a brokered credential to a target
 * @param request
 * @param {Object} target The target to attach the credential to
 * @param {string[]} credentialIds The credential IDs to attach to the target
 * @return {Promise<Serializable>}
 */
export async function addBrokeredCredentials(
  request,
  { target, credentialIds },
) {
  const response = await request.post(
    `/v1/targets/${target.id}:add-credential-sources`,
    {
      data: {
        brokered_credential_source_ids: credentialIds,
        version: target.version,
      },
    },
  );

  return checkResponse(response);
}

/**
 * Adds an injected credential to a target
 * @param request
 * @param {Object} target The target to attach the credential to
 * @param {string[]} credentialIds The credential IDs to attach to the target
 * @return {Promise<Serializable>}
 */
export async function addInjectedCredentials(
  request,
  { target, credentialIds },
) {
  const response = await request.post(
    `/v1/targets/${target.id}:add-credential-sources`,
    {
      data: {
        injected_application_credential_source_ids: credentialIds,
        version: target.version,
      },
    },
  );

  return checkResponse(response);
}

/**
 * Adds a host source to a target
 * @param request
 * @param {Object} target The target to attach the host source to
 * @param {string[]} hostSourceIds The host source IDs to attach to the target
 * @return {Promise<Serializable>}
 */
export async function addHostSource(request, { target, hostSourceIds }) {
  const response = await request.post(
    `/v1/targets/${target.id}:add-host-sources`,
    {
      data: {
        host_source_ids: hostSourceIds,
        version: target.version,
      },
    },
  );

  return checkResponse(response);
}
