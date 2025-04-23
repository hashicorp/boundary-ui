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
   *  Computes the list of active (selected) filters for display.
   *  This getter handles both grouped and ungrouped filters:
      - Grouped filters are matched using `key=value` pairs.
      - Ungrouped filters are matched by item `id`.
   
   * For Example:
      grouped filter - [{ key: 'env', value: 'prod', type: 'tags' }]  
      ungrouped filter - [{ id: 'abc123', name: 'admin', type: 'roles' } ]
   */
  get filters() {
    const { allFilters, selectedFilters } = this.args.filters;
    const isGrouped = this.args.isGrouped;

    const getSelectedSet = (key) => {
      const selected = selectedFilters[key] ?? [];
      return new Set(
        isGrouped
          ? selected.map((s) => `${s.key}=${s.value}`)
          : selected.map((s) => s?.id ?? s),
      );
    };

    // Checks whether the given item is part of the selected filters
    const isSelected = (item, selectedSet) => {
      return isGrouped
        ? selectedSet.has(`${item.key}=${item.value}`)
        : selectedSet.has(item.id);
    };

    // Formats the item based on whether it's grouped or not to return the correct structure
    const formatItem = (item, key) => {
      return isGrouped
        ? {
            key: item.key,
            value: item.value,
            type: key,
          }
        : {
            id: item.id,
            name: item.name,
            type: key,
          };
    };

    // Formats only the selected filter values from all available filters
    return Object.entries(allFilters).flatMap(([key, values]) => {
      assert(`Tags must be an array for key ${key}`, Array.isArray(values));

      const selectedSet = getSelectedSet(key);
      return values
        .filter((item) => isSelected(item, selectedSet))
        .map((item) => formatItem(item, key));
    });
  }

  // =methods

  /**
   * Clears a single filter from queryParams for current route
   * This supports both grouped and ungrouped filters:
   * - Grouped filters are matched using `key=value` pairs.
   * - Ungrouped filters are matched by item `id` or `name`
   * @param {object} tag
   */
  @action
  removeFilter(tag) {
    const { selectedFilters } = this.args.filters;
    const currentValues = selectedFilters[tag.type] ?? [];
    const isGrouped = this.args.isGrouped;
    const updatedValue = currentValues.filter((item) => {
      if (typeof item !== 'object' || item === null) {
        return item !== tag?.id;
      }

      if (isGrouped) {
        return !(item.key === tag.key && item.value === tag.value);
      }

      return item.id !== tag?.id;
    });

    const queryParams = {
      [tag.type]: updatedValue,
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
