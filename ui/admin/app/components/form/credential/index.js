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
    return this.features.isEnabled('json-credentials')
      ? types
      : types.filter((type) => type !== 'json');
  }
}
