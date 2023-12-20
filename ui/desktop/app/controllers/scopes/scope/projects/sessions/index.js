/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import orderBy from 'lodash/orderBy';
import { statusTypes } from 'api/models/session';

export default class ScopesScopeProjectsSessionsIndexController extends Controller {
  // =services

  // =attributes

  queryParams = [
    { targets: { type: 'array' } },
    { status: { type: 'array' } },
    'page',
    'pageSize',
  ];

  @tracked targets = [];
  @tracked status = [];
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
   * @returns {[string]}
   */
  get sessionStatusTypes() {
    return statusTypes;
  }

  /**
   * Sets the targets query param to value of selectedTargets
   * to trigger a query and closes the dropdown
   * @param {object} selectedTargets
   */
  @action
  applyFilter(filter, selectedTargets) {
    this[filter] = [...selectedTargets];
  }
}
