import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeProjectsRoute extends Route {
  // =services

  @service session;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.transitionTo('index');
  }

  /**
   * Loads project scopes for the current scope.
   * @return {Promise
   */
  model() {
    return this.store
      .query('scope', { recursive: true, scope_id: 'global' })
      .filter(({ isProject }) => isProject);
  }

}
