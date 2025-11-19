/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { STATUSES_APP_TOKEN } from 'api/models/app-token';

export default class ScopesScopeAppTokensIndexController extends Controller {
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
   * Filtered app tokens based on search and status
   */
  get filteredAppTokens() {
    if (!this.model?.appTokens) return [];

    let appTokens = [...this.model.appTokens];

    // Apply status filter
    if (this.statuses.length > 0) {
      appTokens = appTokens.filter((token) =>
        this.statuses.includes(token.status),
      );
    }

    // Apply search filter
    const search = this.search?.toLowerCase().trim();
    if (search) {
      appTokens = appTokens.filter((token) => {
        const searchFields = [
          token.name,
          token.description,
          token.id,
          token.status,
        ];

        return searchFields.some((field) =>
          field?.toLowerCase().includes(search),
        );
      });
    }

    return appTokens;
  }

  /**
   * Returns the filtered tokens sorted according to the current sort field and order.
   */
  get sortedAppTokens() {
    const filteredTokens = this.filteredAppTokens;
    const { sortBy, sortOrder } = this;

    return filteredTokens.sort((a, b) => {
      let aValue = this.getSortValue(a, sortBy);
      let bValue = this.getSortValue(b, sortBy);

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      // Handle date sorting
      if (aValue instanceof Date && bValue instanceof Date) {
        const result = aValue.getTime() - bValue.getTime();
        return sortOrder === 'asc' ? result : -result;
      }

      // Handle string/numeric sorting
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const result = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
        return sortOrder === 'asc' ? result : -result;
      }

      // Handle numeric sorting (like expiresIn days)
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const result = aValue - bValue;
        return sortOrder === 'asc' ? result : -result;
      }

      // Fallback to string comparison
      const result = String(aValue)
        .toLowerCase()
        .localeCompare(String(bValue).toLowerCase());
      return sortOrder === 'asc' ? result : -result;
    });
  }

  /**
   * Paginated app tokens
   */
  get paginatedAppTokens() {
    const sortedTokens = this.sortedAppTokens;
    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return sortedTokens.slice(startIndex, endIndex);
  }

  /**
   * Total number of app tokens after filtering
   */
  get totalItems() {
    return this.filteredAppTokens?.length || 0;
  }

  /**
   * Get the sort value for a given property path
   * @param {object} item - The app token object
   * @param {string} sortBy - The property to sort by
   * @returns {any} - The value to sort by
   */
  getSortValue(item, sortBy) {
    switch (sortBy) {
      case 'name':
        return item.name;
      case 'status':
        return item.status;
      case 'approximate_last_access_time':
        return item.approximate_last_access_time;
      case 'expire_time':
        return item.expire_time;
      case 'expiresIn':
        return item.expiresIn;
      case 'id':
        return item.id;
      default:
        return item[sortBy];
    }
  }

  // =actions

  /**
   * Handles input on each keystroke and updates the search queryParam
   * @param {object} event
   */
  @action
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
   * Sets sort values and resets page to 1
   * @param {string} sortBy
   * @param {string} sortOrder
   */
  @action
  onSort(sortBy, sortOrder) {
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    this.page = 1;
  }
}
