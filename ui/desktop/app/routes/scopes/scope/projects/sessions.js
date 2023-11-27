/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { loading } from 'ember-loading';

export default class ScopesScopeProjectsSessionsRoute extends Route {
  // =services

  @service store;
  @service ipc;
  @service session;
  @service router;
  @service can;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.router.transitionTo('index');
  }

  // =actions

  /**
   * Cancels the specified session and notifies user of success or error.
   * @param {SessionModel}
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.canceled-success')
  async cancelSession(session) {
    let updatedSession = session;
    // fetch session from API to verify we have most up to date record
    if (this.can.can('read session', session)) {
      updatedSession = await this.store.findRecord('session', session.id, {
        reload: true,
      });
    }

    await updatedSession.cancelSession();

    await this.ipc.invoke('stop', { session_id: session.id });
    if (
      this.router.currentRoute.name ===
      'scopes.scope.projects.sessions.session.index'
    ) {
      await this.router.replaceWith('scopes.scope.projects.targets');
    }
  }
}
