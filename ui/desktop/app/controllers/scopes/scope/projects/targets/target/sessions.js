/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import sortBy from 'lodash/sortBy';

export default class ScopesScopeProjectsTargetsTargetSessionsController extends Controller {
  // =services

  @service session;

  /**
   * Sessions belonging to the target.
   * @type {SessionModel[]}
   */
  get sessions() {
    return this.model.sessions;
  }

  /**
   * Sort and filter to active sessions of current user.
   * @param {[SessionModel]} model
   * @param {object} session
   * @type {[SessionModel]}
   */
  get cancelableUserSessions() {
    const sessions = this.sessions;
    const userId = this.session.data.authenticated.user_id;
    const filteredSessions = sessions.filter(
      (session) => session.isAvailable && session.user_id === userId
    );

    // Sort sessions
    const sortedSessions = sortBy(filteredSessions, 'created_time').reverse();

    return sortedSessions;
  }
}
