import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { computed } from '@ember/object';

export default class FormCredentialJsonSecretEditorComponent extends Component {
  // =actions
  @tracked allowEditing = false;

  @action
  allowEdit() {
    this.allowEditing = true;
  }

  @computed('args.{isNew,isEditing}')
  get isDetailView() {
    return !this.args.isNew && !this.args.isEditing;
  }

  @computed('args.{isNew,isEditing}', 'allowEditing')
  get isEditView() {
    return !this.args.isNew && (this.args.isEditing && !this.allowEditing);
  }

  @computed('args.{isNew,isEditing}', 'allowEditing')
  get canEdit() {
    return this.args.isNew || (this.args.isEditing && this.allowEditing);
  }
}