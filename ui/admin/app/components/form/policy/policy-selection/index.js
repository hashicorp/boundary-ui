import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class FormPolicySelectionComponent extends Component {
  //attributes
  @tracked selUnit;

  //methods
  /**
   * Force the delete After select list to have `do not delete` option selected
   * @type {boolean}
   */
  get disableDeleteOptions() {
    return this.args.model.retain_for?.days < 0 ? true : false;
  }

  //actions
  /**
   * Handles custom input changes
   */

  @action
  handleInputChange({ target: { value, name: field } }) {
    this.args.model[field] = {
      ...this.args.model[field],
      days: value ? value : null,
    };
  }

  /**
   * Toggle retain for & delete after overridables
   */
  @action
  handleOverridableToggle({ target: { name: field } }) {
    this.args.model[field] = {
      ...this.args.model[field],
      overridable: !this.args.model[field].overridable,
    };
  }
}
