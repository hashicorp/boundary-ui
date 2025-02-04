/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { nanoid } from 'nanoid';
import { checkResponse } from './responseHelper.js';
import { TargetServiceApi } from '../../api-client/apis/TargetServiceApi.js';
import { Configuration } from '../../api-client/runtime.js';

/**
 * Creates a new target
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} scopeId ID of the scope where target will be created
 * @param {string} type type of the target: 'tcp, 'ssh'
 * @param {number} port default port of the target
 * @param {string} address Optional target address
 * @returns {Promise<Serializable>}
 */
export async function createTarget(_request, { scopeId, type, port, address }) {
  const targetService = new TargetServiceApi(
    new Configuration({
      headers: { Authorization: `Bearer ${process.env.E2E_TOKEN}` },
      basePath: process.env.BOUNDARY_ADDR ?? 'http://localhost:9200',
    }),
  );

  const result = targetService.targetServiceCreateTarget({
    item: {
      name: `Target-${nanoid()}`,
      scopeId: scopeId,
      type: type,
      attributes: {
        default_port: port,
      },
      address,
    },
  });

  return result;
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
