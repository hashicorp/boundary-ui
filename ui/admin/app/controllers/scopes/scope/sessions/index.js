/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import {
  STATUS_SESSION_ACTIVE,
  STATUS_SESSION_PENDING,
  STATUS_SESSION_CANCELING,
  statusTypes,
} from 'api/models/session';
import { action } from '@ember/object';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeSessionsIndexController extends Controller {
  // =services

  @service store;
  @service intl;

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
        users: this.model.associatedUsers,
        targets: this.model.associatedTargets,
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
    this.send('refreshAll');
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
}
