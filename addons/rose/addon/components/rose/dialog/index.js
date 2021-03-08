import Component from '@glimmer/component';
import { generateComponentID } from '../../../utilities/component-auto-id';
import { action } from '@ember/object';

export default class RoseDialogComponent extends Component {
  // =attributes

  /**
   * @type {string}
   */
  id = generateComponentID();

  // =methods

  /**
   * Calls the passed dismiss function.  This approach is convenient
   * in case an external dismiss function is not passed into the component,
   * a template error will not be thrown.
   * @param {Function} fn
   */
  @action
  dismiss(fn) {
    fn();
  }
}
