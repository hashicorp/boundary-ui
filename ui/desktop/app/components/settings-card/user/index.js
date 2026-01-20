/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class SettingsUserInfoComponent extends Component {
  // =services

  @service session;
  @service intl;

  // =attributes

  /**
   * Returns true if user is authenticated
   * @type {boolean}
   */
  get isAuthenticated() {
    const { isAuthenticated } = this.session;
    return isAuthenticated;
  }

  /**
   * Returns the type of auth-method used by the user
   * @type {string}
   */
  get authMethod() {
    const {
      data: {
        authenticated: { authenticator },
      },
    } = this.session;
    const formattedAuthenticatorType = authenticator.split(':')[1];
    return this.intl.t(`resources.account.types.${formattedAuthenticatorType}`);
  }
}
