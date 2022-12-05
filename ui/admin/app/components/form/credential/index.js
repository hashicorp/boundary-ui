import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { types } from 'api/models/credential';

export default class FormCredentialComponent extends Component {
  // =services
  @service features;

  // =attributes
  /**
   * @type {object}
   */
  credentialTypes = this.features.isEnabled('json-credentials')
    ? [...types, 'json']
    : types;
}
