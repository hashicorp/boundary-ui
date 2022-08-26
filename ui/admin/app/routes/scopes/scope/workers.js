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

  // The workers model data is loaded in the index route.
  // This is needed to have the transitions from nested worker
  // routes automatically refresh workers data.
  // Loading the data here means they would be considered children
  // and not siblings which means they would not automatically refresh
  // workers when the user navigates back to the list page.

  /**
   * Refreshes worker data.
   */
  @action
  refresh() {
    return super.refresh(...arguments);
  }
}
