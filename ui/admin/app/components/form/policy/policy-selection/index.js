import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class FormPolicySelectionComponent extends Component {
  //methods
  /**
   * This is used to show/hide the custom input field
   * @type {boolean}
   */
  get showCustomInput() {
    if (this.args.name === 'retention_policy') {
      return this.isCustomRetentionSelected;
    } else if (
      this.args.name === 'deletion_policy' &&
      this.args.model.retain_for?.days > 0
    ) {
      return this.isCustomDeletionSelected;
    } else {
      return null;
    }
  }

  /**
   * Returns true if rentention days are greater than 0
   * @type {boolean}
   */
  get isCustomRetentionSelected() {
    return this.args.model.retain_for?.days > 0;
  }

  /**
   * Returns true if deletion days are greater than 0
   * @type {boolean}
   */
  get isCustomDeletionSelected() {
    return this.args.model.delete_after?.days > 0;
  }
  /**
   * Returns true if the toggle is on
   * @type {boolean}
   */
  get isOverridable() {
    return this.args.model[this.args.customInputName]?.overridable;
  }

  get disable() {
    if (
      this.args.name === 'deletion_policy' &&
      this.args.model.retain_for?.days === -1
    ) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * Select options return type is string and we want the `days` in integer format
   * @type {Number}
   */

  convertStringToInt(str) {
    return Number(str);
  }
  //actions
  /**
   * Handles custom input changes
   */
  @action
  handleInputChange({ target: { value, name: field } }) {
    const val = this.convertStringToInt(value);
    this.args.model[field] = {
      ...this.args.model[field],
      days: val,
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

  /**
   * Show custom text field when custom option is selected
   */
  @action
  handlePolicyTypeSelection({ target: { value, name: policy } }) {
    const selectedVal = this.convertStringToInt(value);
    if (policy === 'retention_policy') {
      this.args.model.retain_for = {
        ...this.args.model.retain_for,
        days: selectedVal,
      };
      if (selectedVal < 0) {
        this.args.model.delete_after = {
          ...this.args.model.delete_after,
          days: 0,
        };

        this.isCustomDeletionSelected = false;
        this.isCustomRetentionSelected = false;
      }

      if (selectedVal > 0) {
        this.isCustomRetentionSelected = true;
      } else {
        this.isCustomRetentionSelected = false;
      }
    }

    if (policy === 'deletion_policy') {
      this.args.model.delete_after = {
        ...this.args.model.delete_after,
        days: selectedVal,
      };
      if (selectedVal > 0) {
        this.isCustomDeletionSelected = true;
      } else {
        this.isCustomDeletionSelected = false;
      }
    }
  }
}
