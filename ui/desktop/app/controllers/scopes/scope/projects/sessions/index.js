/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import orderBy from 'lodash/orderBy';
import { debounce } from 'core/decorators/debounce';

export default class ScopesScopeProjectsSessionsIndexController extends Controller {
  // =attributes

  queryParams = ['search'];

  @tracked search;

  /**
   * A list of sessions filtered to the current user and sorted by created time,
   * and active/pending.
   * @type {SessionModel[]}
   */
  get sorted() {
    const sessions = this.model;
    // Sort sessions by created time descending (newest on top)
    const sortedSessions = orderBy(sessions, 'created_time', 'desc');
    return [
      // then move active sessions to the top
      ...sortedSessions.filter((session) => session.isAvailable),
      // and all others to the end
      ...sortedSessions.filter((session) => !session.isAvailable),
    ];
  }

  /**
   * Returns true if model is empty but we have a search term
   * @returns {boolean}
   */
  get noResults() {
    return this.model.length === 0 && this.search;
  }

  /**
   * Returns true if model is empty and we have no search term
   * @returns {boolean}
   */
  get noSessions() {
    return this.model.length === 0 && !this.search;
  }

  /**
   * Handles input on each keystroke and the search queryParam
   * @param {object} event
   */
  @action
  @debounce(250)
  handleSearchInput(event) {
    const { value } = event.target;
    this.search = value;
  }
}
