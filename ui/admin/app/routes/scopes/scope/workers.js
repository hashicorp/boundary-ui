import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ScopesScopeWorkersRoute extends Route {
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

  /**
   * Refreshes worker data.
   */
  @action
  refresh() {
    return super.refresh(...arguments);
  }
}
