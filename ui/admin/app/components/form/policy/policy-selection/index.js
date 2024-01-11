import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class FormPolicySelectionComponent extends Component {
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
