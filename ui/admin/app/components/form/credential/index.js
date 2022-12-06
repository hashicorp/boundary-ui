import Component from '@glimmer/component';
import { types } from 'api/models/credential';

export default class FormCredentialComponent extends Component {
  // =attributes
  /**
   * @type {object}
   */
  credentialTypes = types;
}
