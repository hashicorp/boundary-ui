/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounce } from 'core/decorators/debounce';

export default class ScopesScopeSessionRecordingsIndexController extends Controller {
  // =attributes

  queryParams = [
    'search',
    { users: { type: 'array' } },
    { targets: { type: 'array' } },
    'page',
    'pageSize',
  ];

  @tracked search = '';
  @tracked users = [];
  @tracked targets = [];
  @tracked page = 1;
  @tracked pageSize = 10;

  /**
   * Returns object of filters to be used for displaying selected filters
   * @returns {object}
   */
  get filters() {
    return {
      allFilters: {
        users: this.filterOptions('user'),
        targets: this.filterOptions('target'),
      },
      selectedFilters: {
        users: this.users,
        targets: this.targets,
      },
    };
  }

  /**
   * Returns all filter options for key for session recordings
   * @param {string} key
   * @returns {[object]}
   */
  @action
  filterOptions(key) {
    const uniqueMap = new Map();
    this.model.allSessionRecordings.forEach(
      ({
        create_time_values: {
          [key]: { id, name },
        },
      }) => {
        if (!uniqueMap.has(id)) {
          uniqueMap.set(id, { id, name });
        }
      },
    );
    return Array.from(uniqueMap.values());
  }

  // =actions

  /**
   * Handles input on each keystroke and the search queryParam
   * @param {object} event
   */
  @action
  @debounce(250)
  handleSearchInput(event) {
    const { value } = event.target;
    this.search = value;
    this.page = 1;
  }

  /**
   * Sets the selected items for the given paramKey and sets the page to 1
   * @param {string} paramKey
   * @param {[string]} selectedItems
   */
  @action
  applyFilter(paramKey, selectedItems) {
    this[paramKey] = [...selectedItems];
    this.page = 1;
  }

  /**
   * Refreshes the all data for the current page
   */
  @action
  refresh() {
    this.send('refreshAll');
  }
}
