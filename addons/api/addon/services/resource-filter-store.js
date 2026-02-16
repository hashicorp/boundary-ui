/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Service from '@ember/service';
import { service } from '@ember/service';

/**
 * Takes a POJO representing a query and converts it to a boolean expression
 * string which is understood by the API.
 *
 * @example
 *   const filter = new ResourceFilter({
 *     type: 'oidc',
 *     status: ['active', 'pending'],
 *     authorized_actions: [{ contains: 'read' }]
 *   });
 *   log(filter.queryExpression);
 *   // ("/item/type" == "oidc") and ("/item/status" == "active" or "/item/status" == "pending") and ("read" in "/item/authorized_actions")
 */
export class ResourceFilter {
  // =attributes

  /**
   * @type {?object}
   */
  #filterObject;

  /**
   * @type {string}
   */
  get queryExpression() {
    const clauses = Object.keys(this.#filterObject)
      .map((key) => {
        const value = this.#filterObject[key];
        const valuesArray = Array.isArray(value) ? value : [value];
        return this.parenthetical(
          this.or(
            valuesArray.map((value) => {
              if (value && value.contains) {
                return this.in(value.contains, key);
              }
              return this.equals(key, value);
            }),
          ),
        );
      })
      .flat()
      .filter((item) => item);
    return this.and(clauses);
  }

  // =methods

  /**
   * @param {object} filterObject
   */
  constructor(filterObject = {}) {
    this.#filterObject = Object.assign({}, filterObject);
  }

  /**
   * @param {string} key
   * @param value
   * @return {string}
   */
  equals(key, value) {
    return value !== null ? `"/item/${key}" == "${value}"` : null;
  }

  /**
   * @param {string} key
   * @param value
   * @return {string}
   */
  in(value, key) {
    return value !== null ? `"${value}" in "/item/${key}"` : null;
  }

  /**
   * @param {string[]} clauses
   * @return {string}
   */
  and(clauses) {
    return clauses.join(' and ');
  }

  /**
   * @param {string[]} clauses
   * @return {string}
   */
  or(clauses) {
    return clauses.join(' or ');
  }

  /**
   * @param {string} expression
   * @return {string}
   */
  parenthetical(expression) {
    return expression ? `(${expression})` : null;
  }
}

/**
 *
 */
export default class ResourceFilterStoreService extends Service {
  // =services

  @service store;

  // =methods

  /**
   * Similar to Ember's built-in `store.query`, except this method accepts
   * an additional argument `filterObject` representing a query filter
   * (see ResourceFilter class above).
   * @param {string} modelName
   * @param {object} filterObject
   * @param {?object} storeQuery
   * @return {Promise}
   */
  queryBy(modelName, filterObject = {}, storeQuery = {}) {
    const filter = new ResourceFilter(filterObject);
    const query = Object.assign({}, storeQuery);
    // Apply filters to store query when available
    if (filter.queryExpression) query.filter = filter.queryExpression;
    return this.store.query(modelName, query);
  }
}
