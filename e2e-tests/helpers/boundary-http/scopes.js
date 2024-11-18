/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { nanoid } from 'nanoid';

/**
 * Creates a new org
 * @param {import('@playwright/test').APIRequestContext} request
 * @returns {Promise<Serializable>}
 */
export async function createOrgHttp(request) {
  const org = await request.post(`/v1/scopes`, {
    data: {
      name: 'Org ' + nanoid(),
      scope_id: 'global',
    },
  });
  return await org.json();
}

/**
 * Creates a new project
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} scopeId ID of the scope where target will be created
 * @returns {Promise<Serializable>}
 */
export async function createProjectHttp(request, scopeId) {
  const project = await request.post(`/v1/scopes`, {
    data: {
      name: 'Project ' + nanoid(),
      scope_id: scopeId,
    },
  });
  return await project.json();
}
