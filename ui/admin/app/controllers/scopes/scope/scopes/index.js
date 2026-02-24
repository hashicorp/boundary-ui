/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ScopesScopeScopesIndexController extends Controller {
  // =attributes

  queryParams = [
    'search',
    'page',
    'pageSize',
    'sortAttribute',
    'sortDirection',
  ];

  @tracked search;
  @tracked page = 1;
  @tracked pageSize = 10;
  @tracked sortAttribute;
  @tracked sortDirection;

  // =methods

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

  @action
  sortBy(attribute, direction) {
    this.sortAttribute = attribute;
    this.sortDirection = direction;
    this.page = 1;
  }
}
