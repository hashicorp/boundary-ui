import Route from '@ember/routing/route';

export default class ScopesScopeAuthMethodsAuthMethodAccountsNewRoute extends Route {
  // =methods

  /**
   * Creates a new unsaved account in current scope.
   * @return {AccountModel}
   */
  model() {
    const { id: auth_method_id } = this.modelFor(
      'scopes.scope.auth-methods.auth-method'
    );
    return this.store.createRecord('account', {
      type: 'password',
      auth_method_id,
    });
  }

  /**
   * Renders new account templates for header, navigation, and action page sections.
   * @override
   */
  renderTemplate() {
    super.renderTemplate(...arguments);

    this.render('scopes/scope/auth-methods/auth-method/accounts/new/-header', {
      into: 'scopes/scope/auth-methods/auth-method',
      outlet: 'header',
    });

    this.render('_empty', {
      into: 'scopes/scope/auth-methods/auth-method',
      outlet: 'actions',
    });

    this.render('_empty', {
      into: 'scopes/scope/auth-methods/auth-method',
      outlet: 'navigation',
    });
  }
}
