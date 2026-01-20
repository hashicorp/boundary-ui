/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import {
  GRANT_SCOPE_THIS,
  GRANT_SCOPE_CHILDREN,
  GRANT_SCOPE_DESCENDANTS,
} from 'api/models/role';
import { TYPE_SCOPE_ORG, TYPE_SCOPE_PROJECT } from 'api/models/scope';

export default class ScopesScopeRolesRoleScopesController extends Controller {
  @controller('scopes/scope/roles/index') roles;

  // =services

  @service intl;

  // =attributes

  queryParams = [
    'search',
    { parentScopes: { type: 'array' } },
    { types: { type: 'array' } },
    'page',
    'pageSize',
  ];

  @tracked search;
  @tracked parentScopes = [];
  @tracked types = [];
  @tracked page = 1;
  @tracked pageSize = 10;

  /**
   * Returns parent scopes that are associated with all grant scopes for this role.
   * @type {[ScopeModel]}
   */
  get availableParentScopes() {
    const uniqueParentScopeIds = [];
    const availableParentScopes = [];
    this.model.allGrantScopes.forEach((scope) => {
      if (!uniqueParentScopeIds.includes(scope.scope.id)) {
        uniqueParentScopeIds.push(scope.scope.id);
        const item = scope.scope.name
          ? { id: scope.scope.id, name: scope.scope.name }
          : { id: scope.scope.id };
        availableParentScopes.push(item);
      }
    });
    return availableParentScopes;
  }

  /**
   * Returns scope type options.
   * @type {object}
   */
  get scopeTypeOptions() {
    return [
      {
        id: TYPE_SCOPE_ORG,
        name: this.intl.t(`resources.scope.types.${TYPE_SCOPE_ORG}`),
      },
      {
        id: TYPE_SCOPE_PROJECT,
        name: this.intl.t(`resources.scope.types.${TYPE_SCOPE_PROJECT}`),
      },
    ];
  }

  /**
   * Returns the filters object used for displaying filter tags.
   * @type {object}
   */
  get filters() {
    return {
      allFilters: {
        parentScopes: this.availableParentScopes,
        types: this.scopeTypeOptions,
      },
      selectedFilters: {
        parentScopes: this.parentScopes,
        types: this.types,
      },
    };
  }

  // =methods

  isKeywordThis(id) {
    return id === GRANT_SCOPE_THIS;
  }

  isKeywordChildrenOrDescendants(id) {
    return id === GRANT_SCOPE_CHILDREN || id === GRANT_SCOPE_DESCENDANTS;
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
}
