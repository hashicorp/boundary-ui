/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class ScopesScopeSessionRecordingsIndexController extends Controller {
  // =services

  @service store;
  @service intl;

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
        users: this.filterOptions('user'),
        scopes: this.projectScopes,
        targets: this.filterOptions('target'),
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
   * Returns unique project scopes from targets
   * linked to the session recordings
   * @returns {[object]}
   */
  get projectScopes() {
    const uniqueMap = new Map();
    this.model.allSessionRecordings.forEach(
      ({
        create_time_values: {
          target: {
            scope: { id, name, parent_scope_id },
          },
        },
      }) => {
        if (!uniqueMap.has(id)) {
          const projectName = name || id;
          uniqueMap.set(id, { id, name: projectName, parent_scope_id });
        }
      },
    );
    return Array.from(uniqueMap.values());
  }

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
    this.send('refreshAll');
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
}
