/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class SettingsUserInfoComponent extends Component {
  // =services

  @service session;

  /**
   * Returns the username of the current user
   * @type {string}
   */
  get userInfo() {
    const {
      data: {
        authenticated: { username },
      },
    } = this.session;
    return username;
  }

  /**
   * Returns true if user is authenticated
   * @type {boolean}
   */
  get isAuthenticated() {
    const { isAuthenticated } = this.session;
    return isAuthenticated;
  }

  /**
   * Returns the type of authmethod used by the user
   * @type {string}
   */
  get authMethod() {
    const {
      data: {
        authenticated: { authenticator },
      },
    } = this.session;
    const formattedAuthenticator = authenticator.split(':')[1];
    if (
      formattedAuthenticator === 'oidc' ||
      formattedAuthenticator === 'ldap'
    ) {
      return formattedAuthenticator.toUpperCase();
    }
    return formattedAuthenticator;
  }

  // =actions

  /**
   * Delegates invalidation to the session service.
   */
  @action
  invalidateSession() {
    this.session.invalidate();
  }
}
