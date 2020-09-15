import Component from '@glimmer/component';
import { action } from '@ember/object';
import { computed } from '@ember/object';
import { set } from '@ember/object';

export default class FormAccountPasswordSetPasswordIndexComponent extends Component {

  // =properties

  /**
   * New password property
   * @type {string}
   */
  password;

  /**
   * Submit with password value when it is allowed.
   * Callback with no arguments otherwise.
   * @param {function} fn 
   */
  @action
  submit(fn) {
    fn(`${this.password}`);
    this.resetPassword();
  }

  /**
   * Unset password value before callback.
   * @param {function} fn 
   */
  @action
  cancel(fn) {
    fn();
    this.resetPassword();
  }

  /**
   * @type {boolean}
   */
  @computed('password')
  get cannotSave() {
    return !(this.password?.length > 0);
  }

  resetPassword() {
    set(this, 'password', '');
  }

}
