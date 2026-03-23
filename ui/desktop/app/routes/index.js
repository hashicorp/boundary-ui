/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class IndexRoute extends Route {
  // =services

  @service clusterUrl;
  @service router;
  @service terminal;

  // =methods

  /**
   * If no clusterUrl is specified yet, redirects to cluster-url, otherwise scopes.
   */
  redirect() {
    // cleanup terminal view when navigating to index route - on window reload
    this.terminal.cleanup();

    const rendererClusterUrl = this.clusterUrl.rendererClusterUrl;
    if (!rendererClusterUrl) {
      this.router.replaceWith('cluster-url');
    } else {
      this.router.replaceWith('scopes');
    }
  }
}
