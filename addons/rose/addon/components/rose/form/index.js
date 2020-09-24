import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { computed, action } from '@ember/object';

export default class RoseFormComponent extends Component {

  // =attributes

  /**
   * This field indicates whether edit mode is toggled
   * and only applies if `@showEditToggle` is true.
   * @type {boolean}
   */
  @tracked isEditable = false;

  /**
   * By default, this field is unconditionally equal to the value of the passed
   * `@disabled` argument.  If desired the form may be "locked" from editing
   * until the user intentionally enables edit mode (`@showEditToggle` is true),
   * in which case the value is dependent on `@disabled` and `this.isEditable`.
   * @type {boolean}
   */
  @computed('args.disabled', 'args.showEditToggle', 'isEditable')
  get disabled() {
    if (this.args.showEditToggle) return this.args.disabled || !this.isEditable;
    return this.args.disabled;
  }

  /**
   * True if showEditToggle is true and edit mode is enabled.
   * @type {boolean}
   */
  @computed('args.showEditToggle', 'isEditable')
  get showEditToggleButton() {
    return this.args.showEditToggle && !this.isEditable;
  }

  // =actions

  /**
   * Calls the passed `onSubmit` function while disabling the default form
   * submit behavior.
   * @param {Event} e
   */
  @action
  handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    this.args.onSubmit();
    return false;
  }

  /**
   * Calls the passed `cancel` function.
   * @param {Event} e
   */
  @action
  handleCancel() {
    this.disableEdit();
    this.args.cancel();
  }

  /**
   * Enables edit mode, which only applies when `@showEditToggle` is true.
   */
  @action
  enableEdit() {
    this.isEditable = true;
  }

  /**
   * Disables edit mode, which only applies when `@showEditToggle` is true.
   */
  @action
  disableEdit() {
    this.isEditable = false;
  }

}
