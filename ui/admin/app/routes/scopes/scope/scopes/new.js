/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeScopesNewRoute extends Route {
  // =services

  @service store;
  @service session;
  @service router;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.router.transitionTo('index');
  }

  /**
   * Creates a new unsaved scope belonging to the current scope.
   * @return {ScopeModel}
   */
  model() {
    const { id: scopeID, isOrg } = this.modelFor('scopes.scope');
    // NOTE: if the current scope is an org, we create a project, otherwise
    // it must be global and we create an org.  Boundary does not support
    // scopes under a project, so such a case is ignored.
    const type = isOrg ? 'project' : 'org';
    return this.store.createRecord('scope', { type, scopeID });
  }
}
