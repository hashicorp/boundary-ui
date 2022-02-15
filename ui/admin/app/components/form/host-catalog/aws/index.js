import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class FormHostCatalogAwsComponent extends Component {
  // =actions

  @action
  toggleDisableCredentialRotation(model) {
    model.disable_credential_rotation = !model.disable_credential_rotation;
  }
}
