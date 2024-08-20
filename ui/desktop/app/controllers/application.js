/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ApplicationController extends Controller {
  // =services

  @service ipc;
  @service session;
  @service clusterUrl;
  @service flashMessages;

  // =actions

  /**
   * Delegates invalidation to the session service.
   */
  @action
  invalidateSession() {
    console.log('TEST');
    this.session.invalidate();
  }

  /**
   * Disconnects from clusterUrl and invalidates session, thereby resetting
   * the client and reloading to the onboarding clusterUrl screen.
   */
  @action
  disconnect() {
    this.clusterUrl.resetClusterUrl();
    this.invalidateSession();
  }

  @action
  minimize() {
    this.ipc.invoke('minimizeWindow');
  }

  @action
  toggleFullScreen() {
    this.ipc.invoke('toggleFullscreenWindow');
  }

  @action
  close() {
    this.ipc.invoke('closeWindow');
  }
}
