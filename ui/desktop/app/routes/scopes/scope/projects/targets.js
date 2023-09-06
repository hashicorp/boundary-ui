/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { resourceFilter } from 'core/decorators/resource-filter';

export default class ScopesScopeProjectsTargetsRoute extends Route {
  // =services

  @service can;
  @service clusterUrl;
  @service resourceFilterStore;
  @service router;
  @service session;
  @service store;

  // =attributes

  @resourceFilter({
    allowed: (route) => route.modelFor('scopes.scope.projects'),
    serialize: ({ id }) => id,
    findBySerialized: ({ id }, value) => id === value,
  })
  project;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.router.transitionTo('index');
  }

  /**
   * Loads all targets under current scope.
   *
   * NOTE:  previously, targets were filtered with API filter queries.
   *        In an effort to offload processing from the controller, targets
   *        are now filtered on the client by projects and authorized_actions.
   *
   * @return {Promise{[TargetModel]}}
   */
  async model() {
    const { id: scope_id } = this.modelFor('scopes.scope');
    const queryOptions = { scope_id, recursive: true };

    // Recursively query all targets within the current scope
    let targets = await this.store.query('target', queryOptions);

    // Filter out targets to which users do not have the connect ability
    targets = targets.filter((t) => this.can.can('connect target', t));

    // If project filters are selected, filter targets by the selected projects
    if (this.project?.length) {
      const projectIDs = this.project.map((p) => p?.id);
      targets = targets.filter((t) => projectIDs.includes(t?.scopeID));
    }

    return targets;
  }

  // =actions

  @action
  acknowledge(session) {
    session.acknowledged = true;
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
    this.project = [];
  }

  /**
   * refreshes target data.
   */
  @action
  async refreshTargets() {
    return this.refresh();
  }
}
