/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class FormAccountPasswordChangePasswordIndexComponent extends Component {
  // =properties

  /**
   * @type {string}
   */
  @tracked currentPassword;

  /**
   * @type {string}
   */
  @tracked newPassword;

  /**
   * @type {boolean}
   */
  get canSave() {
    return this.currentPassword && this.newPassword;
  }

  /**
   * @type {boolean}
   */
  get cannotSave() {
    return !this.canSave;
  }

  // =methods

  /**
   * Un-sets the password fields.
   */
  resetPasswords() {
    this.currentPassword = null;
    this.newPassword = null;
  }

  // =actions

  /**
   * Call passed submit function with passwords.
   * Unset passwords before callback.
   * @param {function} fn
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  @action
  submit(fn, currentPassword, newPassword) {
    this.resetPasswords();
    fn(currentPassword, newPassword);
  }

  /**
   * Call passed cancel function.
   * Unset passwords before callback.
   * @param {function} fn
   */
  @action
  cancel(fn) {
    this.resetPasswords();
    fn();
  }
}
