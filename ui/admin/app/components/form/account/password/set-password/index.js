/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class FormAccountPasswordSetPasswordIndexComponent extends Component {
  // =properties

  /**
   * New password property
   * @type {string}
   */
  @tracked password;

  /**
   * @type {boolean}
   */
  get cannotSave() {
    return !this.password;
  }

  // =methods

  /**
   * Unsets the password field.
   */
  resetPassword() {
    this.password = null;
  }

  // =actions

  /**
   * Submit with password value when it is allowed.
   * Callback with no arguments otherwise.
   * @param {function} fn
   * @param {string} password
   */
  @action
  submit(fn, password) {
    this.resetPassword();
    fn(password);
  }
}
