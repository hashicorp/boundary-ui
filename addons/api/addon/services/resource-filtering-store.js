import Service from '@ember/service';
import { inject as service } from '@ember/service';

class ResourceFilters {
  buildQuery(resourceFilters) {
    const filters = this._buildFilters(resourceFilters);
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
    // Coerce single string filters into an array for easy mapping
    if (!Array.isArray(values)) values = [values];
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

export default class ResourceFilteringStoreService extends Service {
  @service store;

  queryBy(modelName, resourceParams, resourceFilters) {
    const filterQuery = new ResourceFilters().buildQuery(resourceFilters);
    // Apply filters to store query when available
    if (filterQuery) resourceParams.filter = filterQuery;
    return this.store.query(modelName, resourceParams);
  }
}
