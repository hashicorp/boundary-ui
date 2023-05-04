/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';

export default class ScopesScopeRoute extends Route {
  // =services

  @service store;
  @service intl;
  @service session;
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
  model({ scope_id: id }) {
    // Since only global and org scopes are authenticatable, we can infer type
    // from ID because global has a fixed ID.
    const type = id === 'global' ? 'global' : 'org';
    return this.store.findRecord('scope', id).catch(() => {
      const maybeExistingScope = this.store.peekRecord('scope', id);
      const scopeOptions = { id, type };
      /* istanbul ignore else */
      if (type === 'global') {
        scopeOptions.name = this.intl.t('titles.global');
      }
      return (
        maybeExistingScope || this.store.createRecord('scope', scopeOptions)
      );
    });
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
      .query('scope', { scope_id: 'global' })
      .catch(() => A([]));
    if (model.isProject) {
      projects = await this.store.query('scope', { scope_id: model.scopeID });
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
    this.scopes = { orgs, projects, selectedOrg, selectedProject };
  }

  /**
   * Adds the scopes hash to the controller context (see `afterModel`).
   * @param {Controller} controller
   */
  setupController(controller) {
    super.setupController(...arguments);
    const scopes = this.scopes;
    controller.setProperties({ scopes });
  }
}
