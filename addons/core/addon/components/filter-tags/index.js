/**
 * Copyright IBM Corp. 2021, 2025
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

  get filters() {
    const { allFilters, selectedFilters } = this.args.filters;
    return Object.entries(allFilters).flatMap(([key, values]) => {
      assert(`Tags must be an array for key ${key}`, Array.isArray(values));
      const uniqueSelectedFilters = [...new Set(selectedFilters[key])];
      if (!uniqueSelectedFilters.length) {
        return [];
      }

      const valueMap = new Map(values.map((value) => [value.id, value.name]));

      return uniqueSelectedFilters.filter(Boolean).map((item) => {
        const filter = {
          id: item,
          type: key,
        };

        if (valueMap.has(item)) {
          filter.name = valueMap.get(item);
        }

        return filter;
      });
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
