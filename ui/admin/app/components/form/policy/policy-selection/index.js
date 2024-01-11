import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class FormPolicySelectionComponent extends Component {
  //attributes
  @tracked isCustomRetentionSelected = this.args.model.retain_for?.days > 0;
  @tracked isCustomDeletionSelected = this.args.model.delete_after?.days > 0;
  @tracked retainForOverridable = this.args.model.retain_for?.overridable;
  @tracked deleteAfterOverridable = this.args.model.delete_after?.overridable;

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
   * Returns true if the toggle is on
   * @type {boolean}
   */
  get isOverridable() {
    return this.args.model[this.args.customInputName]?.overridable;
  }
  //actions
  /**
   * Handles custom input changes
   */
  @action
  handleInputChange({ target: { value, name: field } }) {
    this.args.model[field] = {
      ...this.args.model[field],
      days: value || null,
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
  handlePolicyTypeSelection({ target: { value: selectedVal, name: policy } }) {
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
