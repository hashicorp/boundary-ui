/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { assert } from '@ember/debug';
import { restartableTask } from 'ember-concurrency';
import FilterOptions from 'admin/utils/filter-options';

export default class ScopesScopeSessionRecordingsIndexController extends Controller {
  // =services

  @service store;
  @service intl;
  @service db;

  // =attributes

  queryParams = [
    'search',
    'time',
    { users: { type: 'array' } },
    { scopes: { type: 'array' } },
    { targets: { type: 'array' } },
    'page',
    'pageSize',
    'sortAttribute',
    'sortDirection',
  ];

  now = new Date();

  userFilters = new FilterOptions();
  scopeFilters = new FilterOptions();
  targetFilters = new FilterOptions();

  @tracked search;
  @tracked time = null;
  @tracked users = [];
  @tracked scopes = [];
  @tracked targets = [];
  @tracked page = 1;
  @tracked pageSize = 10;
  @tracked sortAttribute;
  @tracked sortDirection;

  /**
   * Returns object of filters to be used for displaying selected filters
   * @returns {object}
   */
  get filters() {
    return {
      allFilters: {
        time: this.timeOptions,
        users: this.userFilters.allOptions,
        scopes: this.scopeFilters.allOptions,
        targets: this.targetFilters.allOptions,
      },
      selectedFilters: {
        time: [this.time],
        users: this.users,
        scopes: this.scopes,
        targets: this.targets,
      },
    };
  }

  /**
   * Returns array of time options for time filter
   * @returns {[object]}
   */
  get timeOptions() {
    const last24Hours = new Date(this.now.getTime() - 24 * 60 * 60 * 1000);
    const last3Days = new Date(this.now);
    last3Days.setDate(this.now.getDate() - 3);
    const last7Days = new Date(this.now);
    last7Days.setDate(this.now.getDate() - 7);

    return [
      {
        id: last24Hours.toISOString(),
        name: this.intl.t(
          'resources.session-recording.filters.time.last-twenty-four-hours',
        ),
      },
      {
        id: last3Days.toISOString(),
        name: this.intl.t(
          'resources.session-recording.filters.time.last-three-days',
        ),
      },
      {
        id: last7Days.toISOString(),
        name: this.intl.t(
          'resources.session-recording.filters.time.last-seven-days',
        ),
      },
    ];
  }

  /**
   * Configurations for different filter options
   * @returns {[object]}
   */
  get filterConfigs() {
    return {
      userFilters: {
        select: [
          { field: 'user_id', isDistinct: true },
          { field: 'user_name', isDistinct: true },
        ],
        searchFields: ['user_id', 'user_name'],
        mapper: ({ user_id, user_name }) => ({
          id: user_id,
          name: user_name,
        }),
      },
      scopeFilters: {
        select: [
          { field: 'target_scope_id', isDistinct: true },
          { field: 'target_scope_name', isDistinct: true },
          { field: 'target_scope_parent_scope_id', isDistinct: true },
        ],
        searchFields: [
          'target_scope_id',
          'target_scope_name',
          'target_scope_parent_scope_id',
        ],
        mapper: ({
          target_scope_id,
          target_scope_name,
          target_scope_parent_scope_id,
        }) => ({
          id: target_scope_id,
          name: target_scope_name ?? target_scope_id,
          parent_scope_id: target_scope_parent_scope_id,
        }),
      },
      targetFilters: {
        select: [
          { field: 'target_id', isDistinct: true },
          { field: 'target_name', isDistinct: true },
        ],
        searchFields: ['target_id', 'target_name'],
        mapper: ({ target_id, target_name }) => ({
          id: target_id,
          name: target_name,
        }),
      },
    };
  }

  /**
   * Generic retrieve function for session recording options
   * @param {string} type - The type of options to retrieve (user, scope, target)
   * @param {string} search - Search term
   * @returns {Promise<Array>}
   */
  async retrieveFilterOptions(type, search) {
    const config = this.filterConfigs[type];
    assert(`Unknown filter type: ${type}`, config);

    const results = await this.db.query('session-recording', {
      select: config.select,
      query: {
        search: { text: search, fields: config.searchFields },
      },
      page: 1,
      pageSize: 250,
    });

    return results.map(config.mapper);
  }

  loadItems = restartableTask(async () => {
    this.userFilters.options = await this.retrieveFilterOptions('userFilters');
    this.scopeFilters.options =
      await this.retrieveFilterOptions('scopeFilters');
    this.targetFilters.options =
      await this.retrieveFilterOptions('targetFilters');
  });

  // =actions

  /**
   * Looks up org by ID and returns the org name
   * @param {string} orgID
   * @returns {string}
   */
  @action
  orgName(orgID) {
    const org = this.store.peekRecord('scope', orgID);
    return org.displayName;
  }

  /**
   * Handles input on each keystroke and the search queryParam
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
   * Sets the time filter, sets the page to 1, and closes the filter dropdown
   * @param {object} timeId
   * @param {func} onClose
   */
  @action
  changeTimeFilter(timeId, onClose) {
    this.time = timeId;
    this.page = 1;
    onClose();
  }

  /**
   * Refreshes the all data for the current page
   */
  @action
  refresh() {
    this.router.refresh('scopes.scope.session-recordings');
  }

  /**
   * Sets sort values and sets page to 1
   * @param {string} sortBy
   * @param {string} sortOrder
   */
  @action
  onSort(sortBy, sortOrder) {
    this.sortAttribute = sortBy;
    this.sortDirection = sortOrder;
    this.page = 1;
  }

  onFilterSearch = restartableTask(async (filter, value) => {
    this[filter].search = value;
    this[filter].options = await this.retrieveFilterOptions(filter, value);
  });
}
