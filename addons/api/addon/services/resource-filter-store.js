import Service from '@ember/service';
import { inject as service } from '@ember/service';

/**
 * Takes a POJO representing a query and converts it to a boolean expression
 * string which is understood by the API.
 *
 * @example
 *   const filter = new ResourceFilter({
 *     type: 'oidc',
 *     status: ['active', 'pending']
 *   });
 *   console.log(filter.queryExpression);
 *   // ("/item/type" == "oidc") and ("/item/status" == "active" or "/item/status" == "pending")
 */
export class ResourceFilter {
  // =attributes

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
          this.or(valuesArray.map((value) => this.equals(key, value)))
        );
      })
      .flat();
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
   */
  equals(key, value) {
    return `"/item/${key}" == "${value}"`;
  }

  /**
   * @param {string[]} clauses
   */
  and(clauses) {
    return clauses.join(' and ');
  }

  /**
   * @param {string[]} clauses
   */
  or(clauses) {
    return clauses.join(' or ');
  }

  /**
   * @param {string} expression
   */
  parenthetical(expression) {
    return `(${expression})`;
  }
}

export default class ResourceFilterStoreService extends Service {
  @service store;

  queryBy(modelName, filterObject = {}, storeQuery = {}) {
    console.log(filterObject);
    const filter = new ResourceFilter(filterObject);
    const query = Object.assign({}, storeQuery);
    // Apply filters to store query when available
    if (filter.queryExpression) query.filter = filter.queryExpression;
    return this.store.query(modelName, query);
  }
}
