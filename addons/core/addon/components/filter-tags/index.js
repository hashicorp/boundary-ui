/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { assert } from '@ember/debug';

export default class FilterTagsIndexComponent extends Component {
  // =services

  @service router;

  // =attributes


  /**
   * Get the filters based on the selected filters and all filters.
   * @returns {Array} An array of filter objects with id, name, and type properties.
   * if isCustomFilter is true, it returns the selected filters directly for the customer to process further.
   */
  get filters() {
    const { allFilters, selectedFilters } = this.args.filters;

    return Object.entries(allFilters).flatMap(([key, value]) => {
      assert(`Tags must be an array for key ${key}`, Array.isArray(value));

      const paramsSet = new Set(selectedFilters[key]);
      const filters = value.filter((item) => paramsSet.has(item.id));
      return filters.map((item) => ({
        id: item.id,
        name: item.name,
        type: key,
      }));
    });
  }

  // =methods

  /**
   * Clears a single filter from queryParams for current route
   * @param {object} tag
   */
  @action
  removeFilter(tag) {
    const queryParamValue = this.args.filters.selectedFilters[tag.type];

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
    const queryParams = Object.keys(this.args.filters.allFilters).reduce(
      (params, key) => {
        params[key] = [];
        return params;
      },
      {},
    );

    this.router.replaceWith({ queryParams });
  }
}
