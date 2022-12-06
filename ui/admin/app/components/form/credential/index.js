import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { types } from 'api/models/credential';

export default class FormCredentialComponent extends Component {
  // =services
  @service features;

  // =attributes
  /**
   * Returns an array of available credential types the user can create
   * @type {object}
   */
  get credentialTypes() {
    if (this.features.isEnabled('json-credentials')) {
      return types;
    } else {
      return types.filter((type) => type !== 'json');
    }
  }
}
