import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { run } from '@ember/runloop';

export default class FormAuthenticatePasswordComponent extends Component {
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
    run(() => this.resetPassword());
    run(() => fn(creds));
  }
}
