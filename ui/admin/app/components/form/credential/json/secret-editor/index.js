import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class FormCredentialJsonSecretEditorComponent extends Component {
  // =actions
  @tracked allowEditing = false;

  @action
  allowEdit() {
    this.allowEditing = true;
  }

  get isDetailView() {
    return !this.args.isNew && !this.args.isEditing;
  }

  get isEditView() {
    return !this.args.isNew && this.args.isEditing && !this.allowEditing;
  }

  get canEdit() {
    return this.args.isNew || (this.args.isEditing && this.allowEditing);
  }
}
