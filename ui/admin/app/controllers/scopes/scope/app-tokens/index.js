/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { STATUSES_APP_TOKEN } from 'api/models/app-token';

export default class ScopesScopeAppTokensIndexController extends Controller {
  // =services

  @service can;
  @service intl;
  @service router;

  // =attributes

  queryParams = [
    'search',
    'page',
    'pageSize',
    'sortAttribute',
    'sortDirection',
    { statuses: { type: 'array' } },
  ];

  @tracked search;
  @tracked page = 1;
  @tracked pageSize = 10;
  @tracked sortAttribute;
  @tracked sortDirection;
  @tracked statuses = [];

  /**
   * Status options for filtering
   */
  get statusOptions() {
    return STATUSES_APP_TOKEN.map((status) => ({
      id: status,
      name: this.intl.t(`resources.app-token.status.${status}`),
    }));
  }

  /**
   * Returns status badge configuration for app tokens
   * @param {string} status
   * @returns {object}
   */
  @action
  getStatusBadge(status) {
    const statusConfig = {
      active: { color: 'success' },
      expired: { color: 'critical' },
      revoked: { color: 'critical' },
      stale: { color: 'critical' },
      unknown: { color: 'neutral' },
    };

    const config = statusConfig[status] || { color: 'neutral' };
    return {
      text: this.intl.t(`resources.app-token.status.${status}`),
      color: config.color,
    };
  }

  /**
   * Formats date for tooltip display
   * @param {Date} date
   * @returns {string}
   */
  @action
  formatTooltipDate(date) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  /**
   * Returns object of filters to be used for displaying selected filters
   * @returns {object}
   */
  get filters() {
    return {
      allFilters: {
        statuses: this.statusOptions,
      },
      selectedFilters: {
        statuses: this.statuses,
      },
    };
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

  /**
   * Rollback changes to an app-token.
   * @param {AppTokenModel} appToken
   */
  @action
  cancel(appToken) {
    appToken.rollbackAttributes();
    this.router.transitionTo('scopes.scope.app-tokens');
  }

  /**
   * Save an app-token in current scope.
   * @param {AppTokenModel} appToken
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess(() => 'notifications.create-success')
  async create(appToken) {
    await appToken.save();
    if (this.can.can('read model', appToken)) {
      // TODO: Uncomment transition once details route has been created.
      // await this.router.transitionTo(
      //   'scopes.scope.app-tokens.app-token',
      //   appToken,
      // );
    } else {
      this.router.transitionTo('scopes.scope.app-tokens');
    }
    await this.router.refresh();
  }
}
