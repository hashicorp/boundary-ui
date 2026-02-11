/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { STATUSES_APP_TOKEN } from 'api/models/app-token';

export default class ScopesScopeAppTokensIndexController extends Controller {
  // =services

  @service can;
  @service intl;
  @service router;

  // =controllers

  @controller('scopes/scope/app-tokens/new') newAppTokenController;

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

  statusConfig = {
    active: { color: 'success' },
    expired: { color: 'critical' },
    revoked: { color: 'critical' },
    stale: { color: 'critical' },
    unknown: { color: 'neutral' },
  };

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
    const config = this.statusConfig[status] || { color: 'neutral' };
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
  @confirm('resources.app-token.form.confirm-create.description', {
    title: 'resources.app-token.form.confirm-create.title',
    confirm: 'resources.app-token.actions.confirm-create',
  })
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess(() => 'notifications.create-success')
  async create(appToken) {
    // Get original token from the new controller
    const originalToken = this.newAppTokenController.originalToken;

    await appToken.save();
    if (this.can.can('read model', appToken)) {
      const queryParams = { showCreatedAppToken: true };

      // If the original token was inactive, include clonedFrom info to show delete banner
      if (originalToken && !originalToken.isActive) {
        queryParams.clonedFromId = originalToken.id;
        queryParams.clonedFromName = originalToken.displayName;
        queryParams.clonedFromStatus = originalToken.status;
      }

      await this.router.transitionTo(
        'scopes.scope.app-tokens.app-token',
        appToken,
        { queryParams },
      );
    } else {
      this.router.transitionTo('scopes.scope.app-tokens');
    }
  }

  /**
   * Revoke an app-token in current scope.
   * @param {AppTokenModel} appToken
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess(() => 'resources.app-token.messages.revoke.description')
  async revoke(appToken) {
    await appToken.revoke();
    await this.router.refresh('scopes.scope.app-tokens.app-token');
  }

  /**
   * Delete an app-token in current scope.
   * @param {AppTokenModel} appToken
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess(() => 'notifications.delete-success')
  async delete(appToken) {
    await appToken.destroyRecord();
    this.router.transitionTo('scopes.scope.app-tokens');
    await this.router.refresh();
  }
}
