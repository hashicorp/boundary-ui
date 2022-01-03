import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  // =services

  @service router;

  // =methods

  /**
   * Redirects to scopes route for further processing.
   */
  redirect() {
    this.router.transitionTo('scopes');
  }
}
