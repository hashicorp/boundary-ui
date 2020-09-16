import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { computed } from '@ember/object';
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
  @computed('password')
  get cannotSave() {
    return !(this.password?.length > 0);
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
   */
  @action
  submit(fn) {
    try {
      fn(this.password);
    } catch (e) {
      // We want to guarantee password is unset
      this.resetPassword();
      // But we don't want to silence the error
      throw e;
    }
  }

  /**
   * Unset password value before callback.
   * @param {function} fn
   */
  @action
  cancel(fn) {
    try {
      fn();
    } catch (e) {
      // We want to guarantee password is unset
      this.resetPassword();
      // But we don't want to silence the error
      throw e;
    }
  }

}
