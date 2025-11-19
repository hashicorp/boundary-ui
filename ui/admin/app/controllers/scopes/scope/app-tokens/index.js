/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { STATUSES_APP_TOKEN } from 'api/models/app-token';

export default class ScopesScopeAppTokensIndexController extends Controller {
  // =services

  @service router;

  // =attributes

  queryParams = [
    'search',
    'sortBy',
    'sortOrder',
    'page',
    'pageSize',
    { statuses: { type: 'array' } },
  ];

  @tracked search;
  @tracked sortBy = 'name';
  @tracked sortOrder = 'asc';
  @tracked page = 1;
  @tracked pageSize = 10;
  @tracked statuses = [];

  /**
   * Available status options for filtering
   */
  get statusOptions() {
    return STATUSES_APP_TOKEN.map((status) => ({
      id: status,
      name: status.charAt(0).toUpperCase() + status.slice(1), // Capitalize first letter
    }));
  }

  /**
   * App tokens (already filtered and sorted by API)
   */
  get appTokens() {
    return this.model?.appTokens || [];
  }

  /**
   * Total number of app tokens (from API response)
   */
  get totalItems() {
    return this.model?.totalItems || 0;
  }

  // =actions

  /**
   * Handles input on each keystroke and updates the search queryParam
   * @param {object} event
   */
  @action
  handleSearchInput(event) {
    const { value } = event.target;
    this.router.transitionTo({
      queryParams: { search: value || null, page: 1 },
    });
  }

  /**
   * Sets the selected items for the given paramKey and sets the page to 1
   * @param {string} paramKey
   * @param {[string]} selectedItems
   */
  @action
  applyFilter(paramKey, selectedItems) {
    this.router.transitionTo({
      queryParams: {
        [paramKey]: selectedItems.length > 0 ? selectedItems : null,
        page: 1,
      },
    });
  }

  /**
   * Sets sort values and resets page to 1
   * @param {string} sortBy
   * @param {string} sortOrder
   */
  @action
  onSort(sortBy, sortOrder) {
    this.router.transitionTo({
      queryParams: {
        sortBy,
        sortOrder,
        page: 1,
      },
    });
  }
}
