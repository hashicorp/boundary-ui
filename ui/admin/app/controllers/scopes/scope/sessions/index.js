/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import {
  STATUS_SESSION_ACTIVE,
  STATUS_SESSION_CANCELING,
  STATUS_SESSION_PENDING,
  statusTypes,
} from 'api/models/session';
import { action } from '@ember/object';
import { notifyError, notifySuccess } from 'core/decorators/notify';
import { restartableTask } from 'ember-concurrency';
import { assert } from '@ember/debug';
import FilterOptions from 'admin/utils/filter-options';

export default class ScopesScopeSessionsIndexController extends Controller {
  // =services

  @service store;
  @service intl;
  @service db;
  @service router;

  // =attributes

  queryParams = [
    'search',
    { users: { type: 'array' } },
    { targets: { type: 'array' } },
    { status: { type: 'array' } },
    'page',
    'pageSize',
    'sortAttribute',
    'sortDirection',
  ];

  userFilters = new FilterOptions();
  targetFilters = new FilterOptions();

  @tracked search;
  @tracked users = [];
  @tracked targets = [];
  @tracked status = [
    STATUS_SESSION_ACTIVE,
    STATUS_SESSION_PENDING,
    STATUS_SESSION_CANCELING,
  ];
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
        users: this.userFilters.allOptions,
        targets: this.targetFilters.allOptions,
        status: this.sessionStatusOptions,
      },
      selectedFilters: {
        users: this.users,
        targets: this.targets,
        status: this.status,
      },
    };
  }

  /**
   * Returns all status types for sessions
   * @returns {[object]}
   */
  get sessionStatusOptions() {
    return statusTypes.map((status) => ({
      id: status,
      name: this.intl.t(`resources.session.status.${status}`),
    }));
  }

  /**
   * Configurations for different filter options
   * @returns {[object]}
   */
  get filterConfigs() {
    return {
      userFilters: {
        resource: 'user',
        select: [
          { field: 'id', isDistinct: true },
          { field: 'name', isDistinct: true },
        ],
        searchFields: ['id', 'name'],
        filters: {
          joins: [
            {
              resource: 'session',
              joinOn: 'user_id',
            },
          ],
        },
      },
      targetFilters: {
        resource: 'target',
        select: [
          { field: 'id', isDistinct: true },
          { field: 'name', isDistinct: true },
        ],
        searchFields: ['id', 'name'],
        filters: {
          joins: [
            {
              resource: 'session',
              joinOn: 'target_id',
            },
          ],
        },
      },
    };
  }

  /**
   * Generic retrieve function for session filter options
   * @param {string} type - The type of options to retrieve (userFilters, targetFilters)
   * @param {string} search - Search term
   * @returns {Promise<Array>}
   */
  async retrieveFilterOptions(type, search) {
    const config = this.filterConfigs[type];
    assert(`Unknown filter type: ${type}`, config);

    return this.db.query(config.resource, {
      select: config.select,
      query: {
        search: { text: search, fields: config.searchFields },
        filters: config.filters,
      },
      page: 1,
      pageSize: 250,
    });
  }

  loadItems = restartableTask(async () => {
    this.userFilters.options = await this.retrieveFilterOptions('userFilters');
    this.targetFilters.options =
      await this.retrieveFilterOptions('targetFilters');
  });

  // =actions

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
   * Refreshes the all data for the current page
   */
  @action
  refresh() {
    this.router.refresh('scopes.scope.sessions');
  }

  /**
   * Cancels the specified session and notifies the user of success or error
   * @param {SessionModel} session
   */
  @action
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.canceled-success')
  async cancelSession(session) {
    await session.cancelSession();
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
