/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ScopesScopeAuthenticateMethodOidcController extends Controller {
  @controller('scopes/scope/authenticate/method/index') authenticateMethod;

  // =services

  @service session;

  // =actions

  /**
   * Retry by starting a new OIDC authentication flow.
   * @param {object} e
   */
  @action
  async retryAuthentication(e) {
    // TODO: This event handler can be removed when rose dialog gets
    // refactored to use hds.
    e.preventDefault();

    const scope = this.authMethod.scope;
    const authenticatorName = `authenticator:${this.authMethod.type}`;
    await this.authenticateMethod.startOIDCAuthentication(authenticatorName, {
      scope,
      authMethod: this.authMethod,
    });
  }
}
