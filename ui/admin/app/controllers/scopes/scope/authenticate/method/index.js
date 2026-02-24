/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifyError } from 'core/decorators/notify';
import {
  TYPE_AUTH_METHOD_PASSWORD,
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
} from 'api/models/auth-method';

export default class ScopesScopeAuthenticateMethodIndexController extends Controller {
  // =services

  @service session;
  @service windowManager;
  @service router;

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
      case TYPE_AUTH_METHOD_PASSWORD:
      case TYPE_AUTH_METHOD_LDAP:
        await this.session.authenticate(
          authenticatorName,
          creds,
          requestCookies,
          { scope, authMethod },
        );
        break;
      case TYPE_AUTH_METHOD_OIDC:
        await this.startOIDCAuthentication(authenticatorName, {
          scope,
          authMethod,
        });
        this.router.transitionTo('scopes.scope.authenticate.method.oidc');
        break;
    }
  }

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
    await this.windowManager.open(json.attributes.auth_url);
  }
}
