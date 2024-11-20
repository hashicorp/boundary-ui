/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { nanoid } from 'nanoid';

/**
 * Creates a new target
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} scopeId ID of the scope where target will be created
 * @param {string} type type of the target: 'tcp, 'ssh'
 * @param {number} port default port of the target
 * @returns {Promise<Serializable>}
 */
export async function createTargetHttp(request, scopeId, type, port) {
  const target = await request.post(`/v1/targets`, {
    data: {
      name: 'Target ' + nanoid(),
      scope_id: scopeId,
      type: type,
      attributes: {
        default_port: port,
      },
    },
  });

  return await target.json();
}
