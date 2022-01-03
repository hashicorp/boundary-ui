import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AccountRoute extends Route {
  // =services

  @service session;
  @service router;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.router.transitionTo('index');
  }
}
