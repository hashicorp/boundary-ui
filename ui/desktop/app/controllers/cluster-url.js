/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifyError } from 'core/decorators/notify';

export default class ClusterUrlController extends Controller {
  // =services

  @service router;
  @service('cluster-url') clusterUrlService;

  // =actions

  /**
   * Points the API to the specified clusterUrl.  When the main process receives
   * the clusterUrl, it is expected that the renderer will be restarted.
   * @param {string} clusterUrl
   */
  @action
  @loading
  @notifyError(() => 'errors.cluster-url-verification-failed.description', {
    catch: true,
  })
  async setClusterUrl(clusterUrl) {
    await this.clusterUrlService.setClusterUrl(clusterUrl);
    this.router.replaceWith('index');
  }
}
