/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounce } from 'core/decorators/debounce';
import { TYPES_AUTH_METHOD } from 'api/models/auth-method';

export default class ScopesScopeAuthMethodsIndexController extends Controller {
  // =services

  @service intl;

  // =attributes

  queryParams = [
    'search',
    { types: { type: 'array' } },
    { primary: { type: 'array' } },
    'page',
    'pageSize',
  ];

  @tracked search;
  @tracked types = [];
  @tracked primary = [];
  @tracked page = 1;
  @tracked pageSize = 10;

  /**
   * True if the current scope has a primary auth method set.
   * @type {boolean}
   */
  get hasPrimaryAuthMethod() {
    return Boolean(this.scopeModel.primary_auth_method_id);
  }

  get primaryOptions() {
    return [
      { id: 'true', name: this.intl.t('actions.yes') },
      { id: 'false', name: this.intl.t('actions.no') },
    ];
  }

  get authMethodTypeOptions() {
    return TYPES_AUTH_METHOD.map((type) => ({
      id: type,
      name: this.intl.t(`resources.auth-method.types.${type}`),
    }));
  }

  get filters() {
    return {
      allFilters: {
        primary: this.primaryOptions,
        types: this.authMethodTypeOptions,
      },
      selectedFilters: {
        primary: this.primary,
        types: this.types,
      },
    };
  }

  // =actions

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
   * Sets a query param to the value of selectedItems
   * and resets the page to 1.
   * @param {string} paramKey
   * @param {[string]} selectedItems
   */
  @action
  applyFilter(paramKey, selectedItems) {
    this[paramKey] = [...selectedItems];
    this.page = 1;

  /**
   * Removes an item from array `property` at `index` on the
   * passed `authMethod`.  This is used to manage entries in fragment array
   * fields such as `signing_algorithms`.
   * @param {AuthMethodModel} authMethod
   * @param {string} property
   * @param {number} index
   */
  @action
  async removeItemByIndex(authMethod, property, index) {
    const array = authMethod.get(property).filter((item, i) => i !== index);
    authMethod.set(property, array);
  }

  /**
   * Adds a string item to array `property` on the passed `authMethod`.
   * This is used to manage entries in fragment OIDC string array fields such
   * as `signing_algorithms`.
   * @param {AuthMethodModel} authMethod
   * @param {string} property
   * @param {string} value
   */
  @action
  async addStringItem(authMethod, property, value) {
    const existingArray = authMethod[property] ?? [];
    const array = [...existingArray, { value }];
    authMethod.set(property, array);
  }
}
