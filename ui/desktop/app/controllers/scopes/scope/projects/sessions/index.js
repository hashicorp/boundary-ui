/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import orderBy from 'lodash/orderBy';
import { statusTypes } from 'api/models/session';

export default class ScopesScopeProjectsSessionsIndexController extends Controller {
  // =services

  @service intl;

  // =attributes

  queryParams = [
    { targets: { type: 'array' } },
    { status: { type: 'array' } },
    { scopes: { type: 'array' } },
    'page',
    'pageSize',
  ];

  @tracked targets = [];
  @tracked status = [];
  @tracked scopes = [];
  @tracked page = 1;
  @tracked pageSize = 10;

  // =methods

  /**
   * A list of sessions sorted by created time
   * @type {[SessionModel]}
   */
  get sortedSessions() {
    return orderBy(this.model.sessions, 'created_time', 'desc');
  }

  /**
   * Returns targets that are associated will all sessions the user has access to
   * @returns {[TargetModel]}
   */
  get availableTargets() {
    const uniqueSessionTargetIds = new Set(
      this.model.allSessions.map((session) => session.target_id),
    );
    return this.model.allTargets.filter((target) =>
      uniqueSessionTargetIds.has(target.id),
    );
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

  /**
   * Returns scopes that are associated with all sessions the user has access to
   * @returns {[ScopeModel]}
   */
  get availableScopes() {
    const uniqueSessionScopeIds = new Set(
      this.model.allSessions.map((session) => session.scope.id),
    );
    return this.model.projects.filter((project) =>
      uniqueSessionScopeIds.has(project.id),
    );
  }

  /**
   * Returns object of filters to be used for displaying selected filters
   * @returns {object}
   */
  get filters() {
    return {
      targets: this.availableTargets,
      status: this.sessionStatusOptions,
      scopes: this.availableScopes,
    };
  }

  /**
   * Sets the query params to value of selectedItems
   * to trigger a query and closes the dropdown
   * @param {object} selectedTargets
   */
  @action
  applyFilter(filter, selectedItems) {
    this[filter] = [...selectedItems];
    this.page = 1;
  }
}
