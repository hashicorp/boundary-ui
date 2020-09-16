import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class FormAccountPasswordIndexComponent extends Component {

  // =properties

  /**
   * Account password property
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
   * Submit with password value when it is allowed.
   * Callback with no arguments otherwise.
   * @param {function} fn
   */
  @action
  submit(fn) {
    try {
      this.args.model.isNew ? fn(this.password) : fn();
    } catch (e) {
      // We want to guarantee password is unset
      this.resetPassword();
      // But we don't want to silence the error
      throw e;
    }
  }
}
