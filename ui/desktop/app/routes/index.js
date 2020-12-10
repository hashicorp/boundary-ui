import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  // =services

  @service origin;

  // =methods

  /**
   * If no origin is specified yet, redirects to origin, otherwise scopes.
   */
  redirect() {
    const rendererOrigin = this.origin.rendererOrigin;
    if (!rendererOrigin) {
      this.replaceWith('origin');
    } else {
      this.replaceWith('scopes');
    }
  }
}
