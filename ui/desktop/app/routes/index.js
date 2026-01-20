/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

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
