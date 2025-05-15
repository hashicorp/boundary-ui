/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { nanoid } from 'nanoid';
import { checkResponse } from './responseHelper.js';

/**
 * Creates a new alias
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} scopeId ID of the scope where alias will be created
 * @param {string} type type of the alias: 'target'
 * @param {string} value value of the alias
 * @param {string} destination_id Id of the destination of the alias
 * @returns {Promise<Serializable>}
 */
export async function createAlias(request, { scopeId, type, value, destinationId = '' }) {
    const response = await request.post(`/v1/aliases`, {
        data: {
            name: `Alias-${nanoid()}`,
            scope_id: scopeId,
            value: value,
            destination_id: destinationId,
            type: type,
        },
    });

    return checkResponse(response);
}