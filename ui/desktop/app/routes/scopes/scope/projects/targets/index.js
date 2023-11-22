/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeProjectsTargetsIndexRoute extends Route {
  // =services

  @service can;
  @service clusterUrl;
  @service resourceFilterStore;
  @service router;
  @service session;
  @service store;

  // =attributes

  queryParams = {
    search: {
      refreshModel: true,
    },
  };

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
   * @return {Promise{[TargetModel]}}
   */
  async model({ search = '' }) {
    // TODO: Filter targets by scope we're in manually
    // const { id: scope_id } = this.modelFor('scopes.scope');
    const queryOptions = { query: { search } };

    let targets = await this.store.query('target', queryOptions);

    // Filter out targets to which users do not have the connect ability
    targets = targets.filter((target) =>
      this.can.can('connect target', target),
    );

    return targets;
  }
}
