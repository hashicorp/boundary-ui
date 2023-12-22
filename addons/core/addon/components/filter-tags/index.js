import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { assert } from '@ember/debug';

export default class FilterTagsIndexComponent extends Component {
  // =services

  @service router;

  // =attributes

  get filters() {
    return Object.entries(this.args.filters).flatMap(([key, value]) => {
      assert(`Tags must be an array for key ${key}`, Array.isArray(value));
      const paramsSet = new Set(this.getCurrentQueryParams(key));
      const filters = value.filter((item) => paramsSet.has(item.id));

      return filters.map((item) => ({
        id: item.id,
        name: item.name,
        type: key,
      }));
    });
  }

  // =methods

  getCurrentQueryParams(key) {
    let queryParamValue;
    try {
      queryParamValue = JSON.parse(this.router.currentRoute.queryParams[key]);
    } catch {
      // We should never get an error as we are always asserting the queryParam to an array
      queryParamValue = [];
    }
    return queryParamValue;
  }

  /**
   * Clears a single filter from queryParams for current route
   * @param {object} tag
   */
  @action
  removeFilter(tag) {
    const queryParamValue = this.getCurrentQueryParams(tag.type);

    const queryParams = {
      [tag.type]: queryParamValue.filter((item) => item !== tag.id),
    };

    this.router.replaceWith({ queryParams });
  }

  /**
   * Clears all filters based on provided queryParams
   */
  @action
  clearAllFilters() {
    const queryParams = Object.keys(this.args.filters).reduce((params, key) => {
      params[key] = [];
      return params;
    }, {});

    this.router.replaceWith({ queryParams });
  }
}
