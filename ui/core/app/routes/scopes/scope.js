import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';
import { A } from '@ember/array';

export default class ScopesScopeRoute extends Route {
  // =services

  @service intl;
  @service session;

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
      if (type === 'global') {
        scopeOptions.name = this.intl.t('titles.global');
      }
      return (
        maybeExistingScope || this.store.createRecord('scope', scopeOptions)
      );
    });
  }

  /**
   * Load all scopes within the current scope context.  For example,
   * if **this** scope is a project, attempt to load all projects for the owning
   * org, as well as all orgs.  If **this** scope is an org, attempt to load all
   * orgs within the global scope.  These are used for scope navigation.
   */
  async afterModel() {
    this.scopes = await hash({
      orgs: this.store.query('scope', { scope_id: 'global' }).catch(() => A([]))
    });
  }

  /**
   * Adds the scopes hash to the controller context (see `afterModel`).
   * @param {Controller} controller
   */
  setupController(controller) {
    super.setupController(...arguments);
    controller.setProperties({ scopes: this.scopes });
  }

  /**
   * Renders the scope-specific sidebar template.
   * @override
   * @param {object} controller
   * @param {object} model
   */
  renderTemplate(controller, model) {
    super.renderTemplate(...arguments);

    this.render('scopes/scope/-header-nav', {
      into: 'application',
      outlet: 'header-nav',
      model: model,
    });

    this.render('scopes/scope/-sidebar', {
      into: 'scopes/scope',
      outlet: 'sidebar',
      model: model,
    });
  }
}
