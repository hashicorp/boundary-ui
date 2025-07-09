/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { nanoid } from 'nanoid';
import { checkResponse } from './responseHelper.js';

/**
 * Creates a new org
 * @param {import('@playwright/test').APIRequestContext} request
 * @returns {Promise<Serializable>}
 */
export async function createOrg(request) {
  const response = await request.post(`/v1/scopes`, {
    data: {
      name: `Org-${nanoid()}`,
      scope_id: 'global',
    },
  });
  return checkResponse(response);
}

/**
 *
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} orgId
 * @returns {Promise<Serializable>}
 */
export async function deleteOrg(request, orgId) {
  const response = await request.delete(`/v1/scopes/${orgId}`);

  return checkResponse(response, true);
}

/**
 * Creates a new project
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} scopeId ID of the scope where target will be created
 * @returns {Promise<Serializable>}
 */
export async function createProject(request, scopeId) {
  const response = await request.post(`/v1/scopes`, {
    data: {
      name: `Project-${nanoid()}`,
      scope_id: scopeId,
    },
  });
  return checkResponse(response);
}

/**
 * Make Auth Method Primary
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} orgId
 * @param {string} authMethodId
 * @returns {Promise<Serializable>}
 */
export async function makeAuthMethodPrimary(request, { org, authMethodId }) {
  const response = await request.patch(`v1/scopes/${org.id}`, {
    data: {
      primary_auth_method_id: authMethodId,
      version: org.version,
    },
  });

  return checkResponse(response);
}
