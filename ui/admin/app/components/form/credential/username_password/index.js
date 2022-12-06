import Component from '@glimmer/component';
import { types } from 'api/models/credential';

export default class FormUserNamePasswordCredentialComponent extends Component {
  // =attributes
  /**
   * @type {object}
   */
  credentialTypes = types;
}
