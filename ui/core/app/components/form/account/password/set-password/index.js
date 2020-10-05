import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { computed } from '@ember/object';
import { action } from '@ember/object';
import { next } from '@ember/runloop';

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
   */
  @action
  submit(fn) {
    const password = this.password;
    next(() => this.resetPassword());
    fn(password);
  }
}
