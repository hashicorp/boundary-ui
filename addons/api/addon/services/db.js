/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Service, { service } from '@ember/service';
import { modelMapping } from 'api/services/sqlite';
import { assert } from '@ember/debug';
import { generateSQLExpressions } from '../utils/sqlite-query';

/**
 * Database service for querying Boundary resources from storage.
 * Provides a high-level interface for executing queries against the local database.
 */
export default class DbService extends Service {
  @service sqlite;

  /**
   * Query resources from the database by type.
   *
   * @param {string} type - The resource type (e.g., 'scope', 'user', 'target').
   *                        Must be a supported model type defined in modelMapping.
   * @param {Object} query - Query configuration object
   * @returns {Promise<Object>} Promise resolving to query results from sqlite service
   * @throws {Error} Assertion error if resource type is not supported
   */
  query(type, query) {
    const supportedModels = Object.keys(modelMapping);
    assert('Resource type is not supported.', supportedModels.includes(type));

    let { page, pageSize, select, query: queryObj } = query;

    const { sql, parameters } = generateSQLExpressions(type, queryObj, {
      page,
      pageSize,
      select,
    });

    return this.sqlite.fetchResource({
      sql,
      parameters,
    });
  }
}
