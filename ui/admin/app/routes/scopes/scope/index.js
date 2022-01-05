import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeIndexRoute extends Route {
  // =services

  @service session;
  @service router;

  // =methods

  /**
   * Redirects to scopes/scope/authenticate for further processing.
   * If already authenticated, redirects to scopes/scope/scopes to display
   * list of sub scopes.
   */
  redirect(model) {
    if (!this.session.isAuthenticated) {
      this.router.transitionTo('scopes.scope.authenticate');
    } else if (model.isProject) {
      this.router.transitionTo('scopes.scope.edit');
    } else {
      this.router.transitionTo('scopes.scope.scopes');
    }
  }
}
