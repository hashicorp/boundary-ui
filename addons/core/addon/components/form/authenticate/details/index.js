/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class FormAuthenticateDetailsComponent extends Component {
  // =properties

  /**
   * New password property
   * @type {string}
   */
  @tracked password;

  // =methods

  /**
   * Unsets the password field.
   */
  resetPassword() {
    this.password = null;
  }

  // =actions

  /**
   * Submit credentials, but reset the password first in case of failure.
   * Callback with no arguments otherwise.
   * @param {function} fn
   * @param {object} creds
   */
  @action
  submit(fn, creds) {
    this.resetPassword();
    fn(creds);
  }
}
