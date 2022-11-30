import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class FormCredentialJsonSecretEditorComponent extends Component {
  // =properties

  /**
   * Tracks when editor should be displayed
   * @type {boolean}
   */
  @tracked allowEditing = false;

  /**
   * True if viewing the resource after it has been created but not editing it
   * and displays as a read only state. Since this is a secret editor the secret
   * value is not displayed and a skeleton view is show.
   * @type {boolean}
   */
  get isDetailView() {
    return !this.args.isNew && !this.args.isEditing;
  }

  /**
   * True if editing the resource after it has been created but not editing
   * the secret value in the Secret Editor. This will still present the Secret
   * Editor as a read only state even when the form is editing the resource.
   * @type {boolean}
   */
  get isEditView() {
    return !this.args.isNew && this.args.isEditing && !this.allowEditing;
  }

  /**
   * True if creating a new resource or editing the resource after it has been 
   * created and the user has clicked the Secret Editor button while in
   * EditView.
   * @type {boolean}
   */
  get canEdit() {
    return this.args.isNew || (this.args.isEditing && this.allowEditing);
  }

  // =actions

  /**
   * Sets allowEditing to true when Secret Editor
   * button is clicked in Edit view
   */
  @action
  allowEdit() {
    this.allowEditing = true;
  }
}
