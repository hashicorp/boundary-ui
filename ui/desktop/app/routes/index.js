/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

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
  async redirect() {
    const clusterUrl = await this.clusterUrl.getClusterUrl();

    if (!clusterUrl) {
      this.router.replaceWith('cluster-url');
    } else {
      this.router.replaceWith('scopes');
    }
  }
}
