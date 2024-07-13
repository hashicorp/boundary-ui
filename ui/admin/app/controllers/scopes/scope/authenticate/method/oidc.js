/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeAuthenticateMethodOidcController extends Controller {
  @controller('scopes/scope/authenticate/method/index') method;

  // =services

  @service session;

  // =attributes

  /**
   * Authentication URL for the pending OIDC flow, if any.
   * @type {?string}
   */
  get authURL() {
    return this.session.data.pending.oidc.attributes.auth_url;
  }
}
