import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { computed } from '@ember/object';
import { action } from '@ember/object';
import { run } from '@ember/runloop';

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
  @computed('currentPassword', 'newPassword')
  get canSave() {
    return this.currentPassword && this.newPassword;
  }

  /**
   * @type {boolean}
   */
  @computed('canSave')
  get cannotSave() {
    return !this.canSave;
  }

  // =methods

  /**
   * Unsets the password fields.
   */
  resetPasswords() {
    this.currentPassword = null;
    this.newPassword = null;
  }

  // =actions

  /**
   * Call passed submit function with passwords.
   * Unset passwords before callack.
   * @param {function} fn
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  @action
  submit(fn, currentPassword, newPassword) {
    run(() => this.resetPasswords());
    run(() => fn(currentPassword, newPassword));
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
