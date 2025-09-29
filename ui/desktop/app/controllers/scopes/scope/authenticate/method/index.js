/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';
import { loading } from 'core/decorators/loading';
import { notifyError } from 'core/decorators/notify';

export default class ScopesScopeAuthenticateMethodIndexController extends Controller {
  // =services

  @service session;
  @service ipc;
  @service intl;
  @service router;

  // =methods

  /**
   * Kicks off the OIDC auth flow by opening a new window to the provider.
   * @param {string} authenticatorName
   * @param {object} options
   */
  async startOIDCAuthentication(authenticatorName, options) {
    const oidc = getOwner(this).lookup(authenticatorName);
    // TODO: delegate this call from the session service so that we don't have
    // to look up the authenticator directly
    const json = await oidc.startAuthentication(options);
    await this.openExternalOIDCFlow(json.attributes.auth_url);
  }

  /**
   * Opens the specified URL in a new tab or window.  By default this uses
   * `window.open`, but may be overridden.
   * @param {string} url
   */
  async openExternalOIDCFlow(url) {
    await this.ipc.invoke('openExternal', url);
  }

  // =actions

  /**
   * Delegates authentication to an authenticator of type matching the current
   * auth method.  If authentication fails, notifies with an alert.
   */
  @action
  @loading
  @notifyError(() => 'errors.authentication-failed.title', {
    sticky: false,
    catch: true,
  })
  async authenticate(authMethod, creds) {
    const scope = authMethod.scope;
    const authenticatorName = `authenticator:${authMethod.type}`;
    const requestCookies = false;
    switch (authMethod.type) {
      case 'password':
      case 'ldap':
        await this.session.authenticate(
          authenticatorName,
          creds,
          requestCookies,
          { scope, authMethod },
        );
        this.router.transitionTo('index');
        break;
      case 'oidc':
        await this.startOIDCAuthentication(authenticatorName, {
          scope,
          authMethod,
        });
        this.router.transitionTo('scopes.scope.authenticate.method.oidc');
        break;
    }
  }
}
