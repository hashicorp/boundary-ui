import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default class ScopesIndexRoute extends Route {

  // =services

  @service session;

  // =methods

  /**
   * If authenticated, redirects to the scope route of the authenticted scope.
   * If unauthenticated, redirects to the first scope that was loaded (if any).
   * @param {[ScopeModel]} model
   * @param {?ScopeModel} model.firstObject
   */
  redirect({ firstObject }) {
    const authenticatedScopeID =
      get(this.session, 'data.authenticated.scope.id');
    if (authenticatedScopeID) {
      this.transitionTo('scopes.scope', authenticatedScopeID);
    } else if (firstObject) {
      this.transitionTo('scopes.scope', firstObject.id);
    }
  }

}
