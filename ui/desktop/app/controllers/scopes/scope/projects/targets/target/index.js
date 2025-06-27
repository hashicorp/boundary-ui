/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounce } from 'core/decorators/debounce';

export default class ScopesScopeProjectsTargetsTargetIndexController extends Controller {
  // standard naming for importing a controller would be 'target' but
  // this is a special case where using 'target' conflicts with the
  // target route, so we use 'targetController' instead
  @controller('scopes/scope/projects/targets/target') targetController;

  // =attributes

  queryParams = ['page', 'pageSize'];

  @tracked search;
  @tracked page = 1;
  @tracked pageSize = 10;

  // =methods

  get paginatedHosts() {
    return this.hosts.slice(
      (this.page - 1) * this.pageSize,
      this.page * this.pageSize,
    );
  }

  get hosts() {
    let filteredHosts = this.model.hosts;
    if (this.search) {
      filteredHosts = this.model.hosts.filter((host) => {
        const searchTerm = this.search?.toLowerCase() ?? '';
        return (
          host.displayName.toLowerCase().includes(searchTerm) ||
          host.description?.toLowerCase().includes(searchTerm) ||
          host.address?.toLowerCase().includes(searchTerm)
        );
      });
    }

    return filteredHosts;
  }

  /**
   * Returns true if the search query is empty
   * @returns {boolean}
   */
  get noResults() {
    return this.model.hosts.length > 0 && this.hosts.length === 0;
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
}
