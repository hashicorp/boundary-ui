import Route from '@ember/routing/route';

export default class ScopesScopeAuthMethodsAuthMethodAccountsAccountRoute extends Route {

  // =methods

  /**
   * Load an account in current scope.
   * @param {object} params
   * @param {string} params.account_id
   * @return {AccountModel}
   */
  model({ account_id }) {
    return this.store.findRecord('account', account_id, { reload: true });
  }

  /**
   * Renders the route-set specific page sections
   * @override
   */
  renderTemplate() {
    super.renderTemplate(...arguments);

    this.render('scopes/scope/auth-methods/auth-method/accounts/account/-header', {
      into: 'scopes/scope/auth-methods/auth-method',
      outlet: 'header'
    });

    this.render('-empty', {
    // this.render('scopes/scope/auth-methods/auth-method/accounts/account/-actions', {
      into: 'scopes/scope/auth-methods/auth-method',
      outlet: 'actions'
    });

    this.render('scopes/scope/auth-methods/auth-method/accounts/account/-navigation', {
      into: 'scopes/scope/auth-methods/auth-method',
      outlet: 'navigation'
    });
  }

}
