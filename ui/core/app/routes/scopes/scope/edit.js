import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeEditRoute extends Route {

  // =services

  @service session;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.transitionTo('index');
  }
}
