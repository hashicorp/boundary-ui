/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';
import { GRANT_SCOPE_CHILDREN } from 'api/models/role';
import { TYPE_SCOPE_PROJECT } from 'api/models/scope';

class FilterOptions {
  @tracked search;
  @tracked options = [];
}

export default class ScopesScopeAppTokensNewIndexController extends Controller {
  @controller('scopes/scope/app-tokens/index') appTokens;

  // =services

  @service db;

  // =attributes

  queryParams = [
    'search',
    { parentScopes: { type: 'array' } },
    'page',
    'pageSize',
    'showSelectedOnly',
  ];

  parentScopeFilters = new FilterOptions();

  @tracked search;
  @tracked parentScopes = [];
  @tracked page = 1;
  @tracked pageSize = 10;
  @tracked showSelectedOnly = false;

  /**
   * Configuration for scope filter option.
   * @returns {object}
   */
  get filterConfig() {
    return {
      select: [
        { field: 'scope_id', isDistinct: true },
        { field: 'scope_name', isDistinct: true },
      ],
      searchFields: ['scope_id', 'scope_name'],
      mapper: ({ scope_id, scope_name }) => ({
        id: scope_id,
        name: scope_name,
      }),
    };
  }

  /**
   * Returns the filters object used for displaying filter tags.
   * @type {object}
   */
  get filters() {
    return {
      allFilters: {
        parentScopes: this.parentScopeFilters.options,
      },
      selectedFilters: {
        parentScopes: this.parentScopes,
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
   * Generic retrieve function for parent scope options
   * @param {string} type - The type of options to retrieve (scope)
   * @param {string} search - Search term
   * @returns {Promise<Array>}
   */
  async retrieveScopeFilterOptions(search) {
    const config = this.filterConfig;
    const query = { search: { text: search, fields: config.searchFields } };
    const selectedPermission =
      this.model.appToken.permissions?.selectedPermission;
    if (
      this.model.appToken.scope.isGlobal &&
      selectedPermission?.grant_scope_id?.includes(GRANT_SCOPE_CHILDREN)
    ) {
      query.filters = { type: [{ equals: TYPE_SCOPE_PROJECT }] };
    }

    const results = await this.db.query('scope', {
      select: config.select,
      query,
      page: 1,
      pageSize: 250,
    });

    return results.map(config.mapper);
  }

  loadItems = restartableTask(async () => {
    this.parentScopeFilters.options = await this.retrieveScopeFilterOptions();
  });

  onFilterSearch = restartableTask(async (filter, value) => {
    this[filter].search = value;
    this[filter].options = await this.retrieveScopeFilterOptions(value);
  });

  /**
   * Sets a query param to the value of selectedItems
   * and resets the page to 1.
   * @param {string} paramKey
   * @param {[string]} selectedItems
   */
  @action
  applyFilter(paramKey, selectedItems) {
    this[paramKey] = [...selectedItems];
    this.page = 1;
  }

  /**
   * Set showSelectedOnly to bool based on toggle checked status.
   * Also sets showSelectedOnly to false for use cases of resetting
   * the toggle.
   * @param {object} event
   */
  @action
  toggleShowSelectedOnly(event) {
    const { checked } = event?.target || false;
    this.showSelectedOnly = checked;
    this.page = 1;
  }
}
