/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { getOwner } from '@ember/application';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import { notifyError } from 'core/decorators/notify';
import config from '../../../../../config/environment';

const POLL_TIMEOUT_SECONDS = config.oidcPollingTimeoutSeconds;

export default class ScopesScopeAuthenticateMethodOidcRoute extends Route {
  // =services

  @service session;
  @service windowManager;
  @service router;

  // =attributes

  poller = task(async () => {
    while (!this.session.isAuthenticated) {
      await timeout(POLL_TIMEOUT_SECONDS * 1000);
      this.refresh();
    }
  });

  // =methods

  beforeModel;
  model() {
    const scope = this.modelFor('scopes.scope');
    const authMethod = this.modelFor('scopes.scope.authenticate.method');
    const authenticatorName = `authenticator:${authMethod.type}`;
    const oidc = getOwner(this).lookup(authenticatorName);
    // TODO: delegate this call from the session service so that we don't have
    // to look up the authenticator directly
    return oidc.attemptFetchToken({ scope, authMethod });
  }

  /**
   * Adds the auth-method to the controller context.
   * @param {Controller} controller
   */
  setupController(controller) {
    super.setupController(...arguments);
    const authMethod = this.modelFor('scopes.scope.authenticate.method');
    controller.authMethod = authMethod;
  }

  /**
   * When this route is activated (entered), start polling for authentication.
   */
  activate() {
    this.poller.perform();
  }

  /**
   * When this route is deactivated (exited), stop polling for changes and close
   * any windows opened via the window manager service.
   */
  deactivate() {
    this.poller.cancelAll();
    this.windowManager.closeAll();
  }

  /**
   * An error in this route indicates authentication failed.  The user is
   * notified and returned to the index.
   */
  @action
  @notifyError(() => 'errors.authentication-failed.title', { catch: true })
  error(e) {
    this.router.transitionTo('scopes.scope.authenticate.method.index');
    // rethrow the error to activate the notifyError decorator
    throw e;
  }
}
