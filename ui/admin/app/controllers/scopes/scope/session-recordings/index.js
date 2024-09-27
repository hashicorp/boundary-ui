/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounce } from 'core/decorators/debounce';
import { inject as service } from '@ember/service';

export default class ScopesScopeSessionRecordingsIndexController extends Controller {
  // =services

  @service store;
  @service intl;

  // =attributes

  queryParams = [
    'search',
    { times: { type: 'array' } },
    { users: { type: 'array' } },
    { scopes: { type: 'array' } },
    { targets: { type: 'array' } },
    'page',
    'pageSize',
  ];

  @tracked search = '';
  @tracked times = [];
  @tracked users = [];
  @tracked scopes = [];
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
        times: this.timeOptions,
        users: this.filterOptions('user'),
        scopes: this.projectScopes,
        targets: this.filterOptions('target'),
      },
      selectedFilters: {
        times: this.times,
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
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const threeDaysPast = new Date(midnight);
    threeDaysPast.setDate(midnight.getDate() - 3);
    const sevenDaysPast = new Date(midnight);
    sevenDaysPast.setDate(midnight.getDate() - 7);

    return [
      {
        id: midnight.toISOString(),
        name: this.intl.t('resources.session-recording.filters.time.today'),
      },
      {
        id: threeDaysPast.toISOString(),
        name: this.intl.t(
          'resources.session-recording.filters.time.last-three-days',
        ),
      },
      {
        id: sevenDaysPast.toISOString(),
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
    return org.name;
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
   * Sets the time filter, sets the page to 1, and closes the filter dropdown
   * @param {string} timeId
   * @param {func} onClose
   */
  @action
  changeTimeFilter(timeId, onClose) {
    this.times = [timeId];
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
}
