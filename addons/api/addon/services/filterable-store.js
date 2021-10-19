import Store from '@ember-data/store';

class FilterQuery {
  _config;
  constructor(config) {
    this._config = config;
  }

  get query() {
    const filters = this._buildFilters(this._config);
    return this._joinFilters(filters, { inclusive: false });
  }

  /**
   * Iterate through filter config to generate array of filter strings
   * @param {object} config
   */
  _buildFilters(config) {
    let filters = [];
    for (const key in config) {
      filters.push(this._generateQuery(`/item/${key}`, config[`${key}`]));
    }
    return filters;
  }

  /**
   * For a single filter, build filter query
   * @param {string} selector
   * @param {*} values
   */
  _generateQuery(selector, values) {
    // TODO: Check for value type
    const filters = values.map((value) => `"${selector}" == "${value}"`);
    return this._joinFilters(filters, { inclusive: true });
  }

  /**
   * Combine filter strings
   * @param {array} filters
   * @param {object} inclusive
   */
  _joinFilters(filters, { inclusive }) {
    return filters.join(inclusive ? ' or ' : ' and ');
  }
}
export default class FilterableStoreService extends Store {
  /**
   * Filterable store queries using IDs
   * Usage:
   * // Filter for a user in sessions
   * this.store.filterByIds('session', { scope_id, recursive: true }, { user: ['u_0987654321']})
   * // Filter for status in pending or terminated state and for a session id
   * this.store.filterByIds('session', { scope_id },
   *   { status: ['pending', 'terminated' ], target: ['s_U5EoFe4Jba']}
   * )
   * // To remove filters
   * this.store.filterByIds('session', { scope_id })
   * @param {string} modelName
   * @param {object} queryOptions
   * @param {string} filterQuery
   */
  filterByIds(modelName, queryOptions, filterOptions) {
    const filterQuery = new FilterQuery(filterOptions);
    // Apply filters, if available
    if (filterQuery.query) queryOptions.filter = filterQuery;
    return this.query(modelName, queryOptions);
  }
}
