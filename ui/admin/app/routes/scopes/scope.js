/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { A } from '@ember/array';

export default class ScopesScopeRoute extends Route {
  // =services

  @service store;
  @service scope;

  // =methods

  /**
   * Attempt to load the specified scope from the API.  This is allowed
   * to fail, since in some cases the user may not have permission to read a
   * scope directly, but may have permission to read resources under it.
   * If the scope fails to load, we still proceed using a temporary scope object
   * consisting of only the specified ID.
   * @param {object} params
   * @param {string} params.scope_id
   * @return {Promise{ScopeModel}}
   */
  async model({ scope_id: id }) {
    // Since only global and org scopes are authenticatable, we can infer type
    // from ID because global has a fixed ID.
    return this.store.findRecord('scope', id);
  }

  /**
   * Load all scopes within the current scope context.  Always attempt to load
   * org scopes.  Only attempt to load project scopes if the current scope is
   * a project.  These are used for scope navigation.
   */
  async afterModel(model) {
    // First, load orgs and, if necessary, projects
    let orgs, projects;
    orgs = await this.store
      .query('scope', {
        scope_id: 'global',
        query: { filters: { scope_id: [{ equals: 'global' }] } },
      })
      .catch(() => A([]));

    if (model.isProject) {
      projects = await this.store.query('scope', {
        scope_id: model.scopeID,
        query: { filters: { scope_id: [{ equals: model.scopeID }] } },
      });
    }
    // Then pull out the "selected" scopes, if relevant
    let selectedOrg, selectedProject;
    if (model.isGlobal || model.isOrg) selectedOrg = model;
    if (model.isProject) {
      selectedProject = model;
      selectedOrg = this.store.peekRecord('scope', model.scopeID);
    }
    // Update the scope service with the current scope(s);
    this.scope.org = selectedOrg;
    this.scope.project = selectedProject;
    this.scope.orgsList = orgs;
    this.scope.projectsList = projects;
    this.scopes = { orgs, projects, selectedOrg, selectedProject };
    // Update the controller (if exists), since setupController is only
    // called once the first time the route is activated.  It is not called
    // again on route refreshes.
    /* eslint-disable-next-line ember/no-controller-access-in-routes */
    if (this.controller) this.setControllerProperties(this.scopes);
  }

  /**
   * Adds the scopes hash to the controller context (see `afterModel`).
   * @param {Controller} controller
   */
  setupController(/* controller */) {
    super.setupController(...arguments);
    this.setControllerProperties(this.scopes);
  }

  /**
   * Updates the controller's `scopes`.
   * @param {array} scopes
   */
  setControllerProperties(scopes) {
    /* eslint-disable-next-line ember/no-controller-access-in-routes */
    this.controller.setProperties({ scopes });
  }
}
