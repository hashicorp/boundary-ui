/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { debounce } from 'core/decorators/debounce';
import { restartableTask } from 'ember-concurrency';
import {
  GRANT_SCOPE_THIS,
  GRANT_SCOPE_CHILDREN,
  GRANT_SCOPE_DESCENDANTS,
  GRANT_SCOPE_KEYWORDS,
} from 'api/models/role';
import { TYPE_SCOPE_PROJECT } from 'api/models/scope';
class FilterOptions {
  @tracked search;
  @tracked options = [];
}

export default class ScopeOptionsIndexComponent extends Component {
  // =services

  @service db;
  @service intl;
  @service router;
  @service store;

  // =attributes

  @tracked scopes = [];
  @tracked totalItems;
  @tracked search;
  @tracked parentScopes = [];
  @tracked page = 1;
  @tracked pageSize = 10;
  @tracked showSelectedOnly = false;

  parentScopeFilters = new FilterOptions();

  keywords = {
    keyThis: GRANT_SCOPE_THIS,
    keyChildren: GRANT_SCOPE_CHILDREN,
    keyDescendants: GRANT_SCOPE_DESCENDANTS,
  };

  /**
   * Returns root scope displayName.
   * @type {string}
   */
  get scopeDisplayName() {
    if (this.args.model.scope.isGlobal) {
      return this.intl.t('titles.global');
    }
    return this.args.model.scopeModel.displayName;
  }

  /**
   * Returns selected grant scope ids.
   * @type {array}
   */
  get grantScopeIds() {
    const field = this.args.field || this.args.model;
    return field[this.args.name];
  }

  /**
   * Returns count of custom scopes selected.
   * @type {number}
   */
  get customScopesSelectionTotal() {
    const customScopes = this.grantScopeIds?.filter(
      (scope) => !GRANT_SCOPE_KEYWORDS.includes(scope),
    );
    return customScopes?.length;
  }

  /**
   * Returns true if global role does not have "descendants" toggled on
   * or if org role does not have "children" toggled on.
   * Returns false for project scopes as they cannot customize scope selection.
   * @type {boolean}
   */
  get allowCustomScopesSelection() {
    // Project scopes cannot customize scope selection
    if (this.args.model.scope.isProject) {
      return false;
    }
    return (
      (this.args.model.scope.isGlobal &&
        !this.grantScopeIds?.includes(GRANT_SCOPE_DESCENDANTS)) ||
      (this.args.model.scope.isOrg &&
        !this.grantScopeIds?.includes(GRANT_SCOPE_CHILDREN))
    );
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

  // =methods

  constructor() {
    super(...arguments);
    const field = this.args.field || this.args.model;
    field[this.args.name] ??= [];
    this.retrieveData.perform();
    this.loadItems.perform();
  }

  retrieveData = restartableTask(async () => {
    let filters;
    if (this.args.model.scope.isGlobal) {
      // Global level filters
      const canSelectOrgs = !this.grantScopeIds.includes(GRANT_SCOPE_CHILDREN);
      if (canSelectOrgs) {
        filters = { scope_id: [] };
      } else {
        filters = { type: [{ equals: TYPE_SCOPE_PROJECT }], scope_id: [] };
      }
      this.parentScopes.forEach((org) => {
        filters.scope_id.push({ equals: org });
      });
    } else {
      // Org level filters
      filters = { scope_id: [{ equals: this.args.model.scopeID }] };
    }

    if (this.showSelectedOnly) {
      filters.id = [];
      this.grantScopeIds.forEach((scope) => {
        if (scope.startsWith('p_') || scope.startsWith('o_')) {
          filters.id.push({ equals: scope });
        }
      });
    }

    const sort = { attributes: ['type'], direction: 'asc' };
    this.scopes = await this.store.query('scope', {
      scope_id: 'global',
      query: { search: this.search, filters, sort },
      page: this.page,
      pageSize: this.pageSize,
      recursive: true,
    });

    this.totalItems = this.scopes.meta?.totalItems;
  });

  /**
   * Generic retrieve function for parent scope options
   * @param {string} type - The type of options to retrieve (scope)
   * @param {string} search - Search term
   * @returns {Promise<Array>}
   */
  async retrieveScopeFilterOptions(search) {
    const config = this.filterConfig;
    const query = { search: { text: search, fields: config.searchFields } };
    if (
      this.args.model.scope.isGlobal &&
      this.grantScopeIds?.includes(GRANT_SCOPE_CHILDREN)
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

  // =actions

  /**
   * Handles toggle event changes for selected scopes.
   * @param {object} event
   */
  @action
  async toggleField(event) {
    const { checked, value } = event.target;
    const field = this.args.field || this.args.model;
    if (!field[this.args.name]) {
      field[this.args.name] = [];
    }
    const removeValues = (values) => {
      field[this.args.name] = field[this.args.name].filter(
        (item) => !values.some((value) => item.startsWith(value)),
      );
    };
    if (checked) {
      field[this.args.name] = [...field[this.args.name], value];
      if (value === GRANT_SCOPE_CHILDREN) {
        if (this.args.model.scope.isGlobal) {
          removeValues([GRANT_SCOPE_DESCENDANTS, 'o_']);
          await this.toggleShowSelectedOnly();
        } else {
          removeValues(['p_']);
        }
      }
      if (value === GRANT_SCOPE_DESCENDANTS) {
        removeValues([GRANT_SCOPE_CHILDREN, 'o_', 'p_']);
        if (this.args.model.scope.isGlobal) {
          await this.toggleShowSelectedOnly();
        }
      }
    } else {
      removeValues([value]);
      if (this.args.model.scope.isGlobal && value === GRANT_SCOPE_CHILDREN) {
        await this.toggleShowSelectedOnly();
      }
    }
    // Call onChange callback if provided
    this.args.onChange?.();
  }

  /**
   * Handles the selection changes for the paginated table.
   * @param {object} selectableRowsStates
   */
  @action
  async selectionChange({ selectableRowsStates, selectedRowsKeys }) {
    const field = this.args.field || this.args.model;
    selectableRowsStates.forEach((row) => {
      const { isSelected, selectionKey: key } = row;
      const includesId = field[this.args.name].includes(key);
      if (isSelected && !includesId) {
        field[this.args.name] = [...field[this.args.name], key];
      } else if (!isSelected && includesId) {
        field[this.args.name] = field[this.args.name].filter(
          (item) => item !== key,
        );
      }
    });
    if (!selectedRowsKeys.length && this.showSelectedOnly) {
      await this.toggleShowSelectedOnly();
    }
    // Call onChange callback if provided
    this.args.onChange?.();
  }

  /**
   * Set showSelectedOnly to bool based on toggle checked status.
   * Also sets showSelectedOnly to false for use cases of resetting
   * the toggle.
   * @param {object} event
   */
  @action
  async toggleShowSelectedOnly(event) {
    const { checked } = event?.target ?? false;
    this.showSelectedOnly = checked;
    this.page = 1;
    await this.retrieveData.perform();
  }

  /**
   * Handles input on each keystroke
   * @param {object} event
   */
  @action
  @debounce(250)
  async handleSearchInput(event) {
    const { value } = event.target;
    this.search = value;
    this.page = 1;
    await this.retrieveData.perform();
  }

  /**
   * Sets a filter to the value of selectedItems
   * and resets the page to 1.
   * @param {string} filter
   * @param {[string]} selectedItems
   */
  @action
  async applyFilter(filter, selectedItems) {
    this[filter] = [...selectedItems];
    this.page = 1;
    await this.retrieveData.perform();
  }

  /**
   * Sets the page value.
   * @param {number} page
   */
  @action
  async handlePageChange(page) {
    this.page = page;
    await this.retrieveData.perform();
  }

  /**
   * Sets the page size value.
   * @param {number} pageSize
   */
  @action
  async handlePageSizeChange(pageSize) {
    this.page = 1;
    this.pageSize = pageSize;
    await this.retrieveData.perform();
  }

  /**
   * Sets the filter to filterValues.
   * @param {string} filter
   * @param {[string]} filterValues
   */
  @action
  async removeFilter(filter, filterValues) {
    this[filter] = filterValues;
    await this.retrieveData.perform();
  }

  /**
   * Removes all values from filter.
   */
  @action
  async clearAllFilters() {
    this.parentScopes = [];
    await this.retrieveData.perform();
  }
}
