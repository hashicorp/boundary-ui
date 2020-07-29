import Route from '@ember/routing/route';

export default class ScopesScopeAuthenticateIndexRoute extends Route {
  // =methods

  /**
   * This index route exists solely to redirect the user on to the
   * first auth method.
   * @param {object} model
   * @param {[AuthMethodModel]} model.authMethods
   */
  redirect({ authMethods }) {
    const firstAuthMethod = authMethods.firstObject;
    if (firstAuthMethod) {
      this.transitionTo('scopes.scope.authenticate.method', firstAuthMethod);
    }
  }
}
