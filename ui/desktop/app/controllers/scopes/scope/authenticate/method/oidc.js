/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class ScopesScopeAuthenticateMethodOidcController extends Controller {
  @controller('scopes/scope/authenticate/method/index') authenticateMethod;

  // =services

  @service session;
  @service router;

  // =actions

  /**
   * Retry by starting a new OIDC authentication flow.
   */
  @action
  async retryAuthentication() {
    const scope = this.authMethod.scope;
    const authenticatorName = `authenticator:${this.authMethod.type}`;
    await this.authenticateMethod.startOIDCAuthentication(authenticatorName, {
      scope,
      authMethod: this.authMethod,
    });
  }
}
