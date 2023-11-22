/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { resourceFilter } from 'core/decorators/resource-filter';

export default class ScopesScopeProjectsSessionsIndexRoute extends Route {
  // =services

  @service session;
  @service resourceFilterStore;

  // =attributes

  @resourceFilter({
    allowed: ['active', 'pending', 'canceling', 'terminated'],
    defaultValue: ['active', 'pending', 'canceling'],
  })
  status;

  @resourceFilter({
    allowed: (route) => route.modelFor('scopes.scope.projects'),
    serialize: ({ id }) => id,
    findBySerialized: ({ id }, value) => id === value,
  })
  project;

  // =methods

  /**
   * Loads all sessions under current scope for the current user.
   *
   * NOTE:  previously, sessions were filtered only with API filter queries.
   *        In an effort to offload processing from the controller, sessions
   *        are now filtered on the client by projects and status,
   *        while user_id filtering remains server side.
   *
   * @return {Promise{[SessionModel]}}
   */
  async model() {
    const { id: scope_id } = this.modelFor('scopes.scope');
    const queryOptions = {
      scope_id,
      recursive: true,
      include_terminated: this.status?.includes('terminated'),
    };

    // Recursively query sessions within the current scope for the current user
    let sessions = await this.resourceFilterStore.queryBy(
      'session',
      { user_id: this.session.data.authenticated.user_id },
      queryOptions,
    );

    // If project filters are selected, filter sessions by the selected projects
    if (this.project?.length) {
      const projectIDs = this.project.map((p) => p?.id);
      sessions = sessions.filter((s) => projectIDs.includes(s?.scopeID));
    }

    // If status filters are selected, filter sessions by the selected statuses
    if (this.status?.length) {
      sessions = sessions.filter((s) => this.status.includes(s?.status));
    }

    return sessions;
  }

  /**
   * Sets the specified resource filter field to the specified value.
   * @param {string} field
   * @param value
   */
  @action
  filterBy(field, value) {
    this[field] = value;
  }

  /**
   * Clears and filter selections.
   */
  @action
  clearAllFilters() {
    this.status = [];
    this.project = [];
  }
}
