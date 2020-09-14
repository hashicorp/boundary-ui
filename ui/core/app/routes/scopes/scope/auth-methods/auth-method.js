import Route from '@ember/routing/route';

export default class ScopesScopeAuthMethodsAuthMethodRoute extends Route {
  // =methods

  /**
   * Load a single auth-method in current scope.
   * @param {object} params
   * @param {string} params.auth_method_id
   * @return {authMethodModel}
   */
  async model({ auth_method_id }) {
    return this.store.findRecord('auth-method', auth_method_id);
  }

  /**
   * Renders the auth-method specific templates for header, navigation,
   * and actions page sections.
   * @override
   */
  renderTemplate() {
    super.renderTemplate(...arguments);

    this.render('scopes/scope/auth-methods/auth-method/-header', {
      into: 'scopes/scope/auth-methods/auth-method',
      outlet: 'header',
    });

    this.render('scopes/scope/auth-methods/auth-method/-navigation', {
      into: 'scopes/scope/auth-methods/auth-method',
      outlet: 'navigation',
    });

    this.render('scopes/scope/auth-methods/auth-method/-actions', {
      into: 'scopes/scope/auth-methods/auth-method',
      outlet: 'actions',
    });
  }
}
