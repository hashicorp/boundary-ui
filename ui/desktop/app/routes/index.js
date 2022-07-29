import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  // =services

  @service clusterUrl;
  @service router;

  // =methods

  /**
   * If no clusterUrl is specified yet, redirects to cluster-url, otherwise scopes.
   */
  redirect() {
    const rendererClusterUrl = this.clusterUrl.rendererClusterUrl;
    if (!rendererClusterUrl) {
      this.router.replaceWith('cluster-url');
    } else {
      this.router.replaceWith('scopes');
    }
  }
}
