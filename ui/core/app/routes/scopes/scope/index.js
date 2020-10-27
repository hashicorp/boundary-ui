import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeIndexRoute extends Route {
  // =services

  @service session;

  // =methods

  /**
   * Redirects to scopes/scope/authenticate for further processing.
   */
  redirect() {
    if (!this.session.isAuthenticated) {
      this.transitionTo('scopes.scope.authenticate');
    }
  }
}
