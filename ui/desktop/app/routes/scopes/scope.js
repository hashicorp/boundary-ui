import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';

export default class ScopesScopeRoute extends Route {
  // =services

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
      console.error('caught error');
      const maybeExistingScope = this.store.peekRecord('scope', id);

      const scopeOptions = { id, type };
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
    // Load all orgs
    let orgs;
    orgs = await this.store.query('scope', { scope_id: 'global' })
      .catch(() => A([]));
    // Then pull out the "selected" scopes, if relevant
    let selectedOrg;
    if (model.isGlobal || model.isOrg) selectedOrg = model;

    let projects;
    if(model.isGlobal) {
      projects = orgs.map((id) => this.store.query('scope', { scope_id: id }));
    }
    if(model.isOrg) {
      projects = this.store.query('scope', { scope_id: model.id });
    }

    // Update the scope service with the current scope(s);
    this.scope.org = selectedOrg;
    this.scope.projects = await projects;
    this.scopes = { orgs, selectedOrg };
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

  /**
   * Renders the scope-specific sidebar template.
   * @override
   * @param {object} controller
   * @param {object} model
   */
  renderTemplate() {
    super.renderTemplate(...arguments);
    this.render('scopes/scope/-header-nav', {
      into: 'application',
      outlet: 'header-nav',
    });
  }
}
