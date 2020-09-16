import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class FormAccountPasswordIndexComponent extends Component {

  // =properties

  /**
   * Account password property
   * @type {string}
   */
  password;

  // =actions

  /**
   * Submit with password value when it is allowed.
   * Callback with no arguments otherwise.
   * @param {function} fn
   */
  @action
  submit(fn) {
    this.args.model.isNew ? fn(this.password) : fn();
    delete this.password;
  }
}
