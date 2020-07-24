import Route from '@ember/routing/route';

export default class ScopesScopeIndexRoute extends Route {

  // =methods

  /**
   * Redirects to scopes/scope/authenticate for further processing.
   */
  redirect() {
    this.transitionTo('scopes.scope.authenticate');
  }

}
