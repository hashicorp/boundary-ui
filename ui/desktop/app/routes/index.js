import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  // =services

  @service clusterUrl;
  @service router;

  // =methods

  /**
   * If no origin is specified yet, redirects to origin, otherwise scopes.
   */
  redirect() {
    const rendererClusterUrl = this.clusterUrl.rendererClusterUrl;
    if (!rendererClusterUrl) {
      this.router.replaceWith('origin');
    } else {
      this.router.replaceWith('scopes');
    }
  }
}
