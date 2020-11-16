import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  // =services

  @service session;

  // =methods

  /**
   * If no origin is specified yet, redirects to origin, otherwise scopes.
   */
  redirect() {
    const rendererOrigin = this.session.data.origin;
    if (!rendererOrigin) {
      this.replaceWith('origin');
    } else {
      this.replaceWith('scopes');
    }
  }
}
